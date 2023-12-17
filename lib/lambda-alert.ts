import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as snsSubscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as actions from "aws-cdk-lib/aws-cloudwatch-actions";
import * as lambdaSDK from 'aws-sdk';
import {Construct} from 'constructs';
import {IFunction} from "aws-cdk-lib/aws-lambda";


export type LambdaTimeoutAlertProps = {
    function: IFunction[];
}

export class LambdaTimeoutAlertConstruct extends Construct {

    constructor(scope: Construct, id: string, props?: LambdaTimeoutAlertProps) {
        super(scope, id);


        const lambdaClient = new lambdaSDK.Lambda();
        const allFunctions = lambdaClient.listFunctions().promise();

        const snsTopic = new sns.Topic(this, 'Lmada-sns-topic');
        snsTopic.addSubscription(new snsSubscriptions.EmailSubscription('oluwatobi.t.adenekan@gmail.com'));

        const accountFunctions = allFunctions
            ?.then(functions => {
                return functions?.Functions?.map(lamdaFunction => {
                    return lambda.Function.fromFunctionArn(
                        this,
                        `LamdaFunction-${lamdaFunction.FunctionName}`,
                        lamdaFunction?.FunctionArn || ""
                    );
                });
            });

        accountFunctions?.then((functions: IFunction[] | undefined) => {
            const lambdaFunctions: lambda.IFunction[] = []
            if (functions) {
                lambdaFunctions.push(...functions);
            }
            if (props?.function) {
                lambdaFunctions.push(...props.function)
            }


            lambdaFunctions.forEach(lambdaFunction => {
                const durationAlarm = new cloudwatch.Alarm(this, `LamdaDurationAlarm-${lambdaFunction.node.id}`, {
                    metric: lambdaFunction.metricDuration({
                        statistic: "max"
                    }), // Monitor function duration metric
                    alarmName: lambdaFunction.node.id,
                    threshold: 10, // Set your threshold for timeout
                    evaluationPeriods: 1,
                    actionsEnabled: true,
                });

                durationAlarm.addAlarmAction(
                    new actions.SnsAction(snsTopic)
                );
            })


        })


    }
}
