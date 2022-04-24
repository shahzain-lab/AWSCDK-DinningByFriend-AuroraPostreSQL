import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as events from 'aws-cdk-lib/aws-events';
import * as appsync from '@aws-cdk/aws-appsync-alpha';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as eventsTargets from 'aws-cdk-lib/aws-events-targets'
import { GQL_MUTATIONS } from '../utils/mutations';
import * as stepFunctions from "aws-cdk-lib/aws-stepfunctions";
import * as stepFunctionTasks from "aws-cdk-lib/aws-stepfunctions-tasks";
import { APPSYNC_EVENT_SOURCE, mutRequestTemplate, mutResponseTemplate } from '../utils/appsync-mutation-template';
import { queRequestTemplate,queresponseTemplate } from '../utils/appsync-query-template';
import { GQL_QUERIES } from '../utils/queries';

export class AwscdkDinningByFriendAuroraPostreSqlStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, 'dinningByFriend-auroraPostgre');

    const cluster = new rds.ServerlessCluster(this, 'dinningByFriend-serverlessCluster', {
      vpc,
      engine: rds.DatabaseClusterEngine.AURORA_POSTGRESQL,
      parameterGroup: rds.ParameterGroup.fromParameterGroupName(this, 'ParameterGroup', 'default.aurora-postgresql10'),
      defaultDatabaseName: "dinningByFriend",
      scaling: {
        autoPause: cdk.Duration.seconds(0)
      }
    })
    

    const api = new appsync.GraphqlApi(this, 'restaurant-graphql-api', {
      name: 'dinning-by-friend aurora serverless',
      schema: appsync.Schema.fromAsset('graphql/schema.gql'),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY,
          apiKeyConfig: {
            expires: cdk.Expiration.after(cdk.Duration.days(100))
          }
        }
      }
    })

    const lambdaNames = {
      queryHandler: "queryHandler",
      mutationHandler: "mutationHandler",
    }
    const lambdaFn: { [P in keyof typeof lambdaNames]?: lambda.IFunction } = {};

    Object.keys(lambdaNames).forEach((name) => {
      const key = name as keyof typeof lambdaNames
      lambdaFn[key] = new lambda.Function(this, key, {
        functionName: `dinningByFriend${key}`,
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset('lambdas'),
      handler: `${key}.handler`,
      memorySize: 1024,
      environment: {
        CLUSTER_ARN: cluster.clusterArn,
        SECRET_ARN: cluster.secret?.secretArn || '',
        DB_NAME: 'dinningByFriend',
        AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1'
      },
      });
    })

    cluster.grantDataApiAccess(lambdaFn["mutationHandler"]!);
    cluster.grantDataApiAccess(lambdaFn["queryHandler"]!);


    const httpEventTriggerDS = api.addHttpDataSource(
      "eventTriggerDS",
      "https://events." + this.region + ".amazonaws.com/", // This is the ENDPOINT for eventbridge.
      {
        name: "restauantHTTPDSWithEventBridge",
        description: "From Appsync to Eventbridge",
        authorizationConfig: {
          signingRegion: this.region,
          signingServiceName: "events",
        },
      }
    );
    events.EventBus.grantAllPutEvents(httpEventTriggerDS);

    GQL_MUTATIONS.forEach((mut) => {
      let details = `\\\"id\\\": \\\"$ctx.args.id\\\"`;
      if (mut === 'add_user') {
        details = `\\\"userId\\\":\\\"$ctx.args.new_user.user_Id\\\", \\\"username\\\":\\\"$ctx.args.new_user.user_Name\\\",  \\\"email\\\":\\\"$ctx.args.new_user.user_email\\\"`
      } else if (mut === "add_friend") {
        details = `\\\"id\\\":\\\"$ctx.args.new_friend.id\\\", \\\"userId\\\":\\\"$ctx.args.new_friend.user_id\\\", \\\"friendname\\\":\\\"$ctx.args.new_friend.friend_Name\\\"`
      } else if (mut === "add_restaurant") {
        details = `\\\"id\\\":\\\"$ctx.args.new_restaurant.restaurant_Id\\\", \\\"ownerId\\\":\\\"$ctx.args.new_restaurant.owner_id\\\", \\\"restaurantname\\\":\\\"$ctx.args.new_restaurant.restaurant_Name\\\"`
      } else if (mut === "create_recipe") {
        details = `\\\"id\\\":\\\"$ctx.args.recipe.recipe_ID\\\", \\\"restaurantId\\\":\\\"$ctx.args.recipe.restaurant_Id\\\", \\\"recipename\\\":\\\"$ctx.args.recipe.recipe_Name\\\"`
      } else if (mut === "create_review") {
        details = `\\\"id\\\":\\\"$ctx.args.review.reviews_Id\\\", \\\"recipeId\\\":\\\"$ctx.args.review.recipe_Id\\\", \\\"review\\\":\\\"$ctx.args.review.review\\\"`
      }
      httpEventTriggerDS.createResolver({
        typeName: "Mutation",
        fieldName: mut,
        requestMappingTemplate: appsync.MappingTemplate.fromString(mutRequestTemplate(details, mut)),
        responseMappingTemplate: appsync.MappingTemplate.lambdaResult(),
      });
    });

    GQL_QUERIES.forEach((query) => {
      let details = `\\\"id\\\": \\\"$ctx.args.id\\\"`;
      if (query === 'get_user') {
        details = `\\\"userId\\\":\\\"$ctx.args.user_id\\\"`
      } else if (query === "get_friend") {
        details = `\\\"id\\\":\\\"$ctx.args.friend_id\\\"`
      } else if (query === "get_recipe") {
        details = `\\\"id\\\":\\\"$ctx.args.recipe_id\\\"`
      } else if (query === "get_restaurant") {
        details = `\\\"id\\\":\\\"$ctx.args.restaurant_id\\\"`
      } else if (query === "get_friendOfFriend") {
        details = `\\\"id\\\":\\\"$ctx.args.friend_id\\\"`
      }else if (query === "get_review") {
        details = `\\\"id\\\":\\\"$ctx.args.id\\\"`
      }else if (query === "all_freinds") {
        details = `\\\"userId\\\":\\\"$ctx.args.user_Id\\\"`
      }else if (query === "all_recipes") {
        details = `\\\"restaurantId\\\":\\\"$ctx.args.restaurant_Id\\\"`
      }else if (query === "all_reviews") {
        details = `\\\"recipeId\\\":\\\"$ctx.args.recipe_id\\\"`
      }else if (query === "all_restaurants") {
        details = `\\\"userId\\\":\\\"$ctx.args.user_id\\\"`
      }else if (query === "all_friendOfFreind") {
        details = `\\\"friendId\\\":\\\"$ctx.args.friend_id\\\"`
      }
      httpEventTriggerDS.createResolver({
        typeName: "Query",
        fieldName: query,
        requestMappingTemplate: appsync.MappingTemplate.fromString(queRequestTemplate(details, query)),
        responseMappingTemplate: appsync.MappingTemplate.lambdaResult(),
      });
    });

    const requestFilterHandler = new lambda.Function(this, 'requestFilterHandler',{
      functionName: `dinningByFriend-requestFilterHandler`,
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset('lambdas'),
      handler: `index.handler`,
      memorySize: 1024,
    })

    const lambdaIndex = new stepFunctionTasks.LambdaInvoke(
      this,
      "requestFilterHandlerlambda",
      {
        lambdaFunction: requestFilterHandler,
      }
    );


    const mutationHandler = new stepFunctionTasks.LambdaInvoke(
      this,
      "mutationHandlerlambda",
      {
        lambdaFunction: lambdaFn["mutationHandler"]!,
      }
    );

    const queryHandler = new stepFunctionTasks.LambdaInvoke(
      this,
      "queryHandlerlambda",
      {
        lambdaFunction: lambdaFn["queryHandler"]!,
      }
    );


    const choice = new stepFunctions.Choice(this, "operation successful?");
    choice.when(
      stepFunctions.Condition.stringEquals(
        "$.Payload.operation",
        "mutation"
      ),
      mutationHandler
    );
    choice.when(
      stepFunctions.Condition.stringEquals(
        "$.Payload.operation",
        "query"
      ),
      queryHandler
    );

    // creating chain to define the sequence of execution

    const chain = stepFunctions.Chain.start(lambdaIndex).next(choice);

    // create a state machine

    const stateMechine = new stepFunctions.StateMachine(this, "choiceStateMachine", {
      stateMachineName: 'dinningByFriend-stateMechine',
      definition: chain,
    });

    new events.Rule(this, "eventConsumerRule", {
      eventPattern: {
        source: [APPSYNC_EVENT_SOURCE],
        detailType: [...GQL_MUTATIONS,...GQL_QUERIES],
      },
      targets: [new eventsTargets.SfnStateMachine(stateMechine)]
    });
    
  }
}
