import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as snsSubscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as actions from "aws-cdk-lib/aws-cloudwatch-actions";
import * as lambdaSDK from 'aws-sdk';
import { Construct } from 'constructs';

export class LambdaTimeoutAlertConstruct extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);


    const lambdaClient = new lambdaSDK.Lambda();
    const allFunctions = lambdaClient.listFunctions().promise();

    const snsTopic = new sns.Topic(this, 'Lmada-sns-topic');
    snsTopic.addSubscription(new snsSubscriptions.EmailSubscription('summioj@gmail.com'));

    allFunctions?.then(functions => {
      functions?.Functions?.forEach(lamdaFunction=> {
        const existingFunction = lambda.Function.fromFunctionArn(
          this,
          `LamdaFunction-${lamdaFunction.FunctionName}`, 
          lamdaFunction?.FunctionArn || ""
        );

        const durationAlarm = new cloudwatch.Alarm(this, `LamdaDurationAlarm-${lamdaFunction.FunctionName}`, {
          metric: existingFunction.metricDuration(), // Monitor function duration metric
          threshold: 10, // Set your threshold for timeout
          evaluationPeriods: 1,
          actionsEnabled: true,
        });
        
        durationAlarm.addAlarmAction(
          new actions.SnsAction(snsTopic)
            );

      });
    });
  }
}
