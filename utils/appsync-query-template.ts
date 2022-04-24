import { APPSYNC_EVENT_SOURCE } from "./appsync-mutation-template"


export const queRequestTemplate = (detail:string, detailType:string)=>{

    return `{
        "version": "2018-05-29",
        "method": "GET",
        "resourcePath": "/",
        "params": {
          "headers": {
            "content-type": "application/x-amz-json-1.1",
            "x-amz-target":"AWSEvents.PutEvents"
          },
          "body": {
            "Entries":[
              {
                "DetailType":"${detailType}",
                "Source":"${APPSYNC_EVENT_SOURCE}",
                "EventBusName": "default",
                "Detail": "{${detail}}"
              }
            ]
          }
        }
      }`
}

export const queresponseTemplate = ()=>{

    return`
        #if($ctx.error)
        $util.error($ctx.error.message, $ctx.error.type)
        #end
        #if($ctx.result.statusCode == 200)
        {
            "result": "$util.parseJson($ctx.result.body)"
        }
        #else
        $utils.appendError($ctx.result.body, $ctx.result.statusCode)
        #end
    `
}