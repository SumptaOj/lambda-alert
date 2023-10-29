#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { CdkWorkshopTsStack } from '../lib/cdk-workshop-ts-stack';

const app = new cdk.App();
new CdkWorkshopTsStack(app, 'CdkWorkshopTsStack');
