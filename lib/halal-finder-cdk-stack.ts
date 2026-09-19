import * as cdk from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as cloudtrail from 'aws-cdk-lib/aws-cloudtrail';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export class HalalFinderCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ========== LAB 1: COGNITO AUTHENTICATION ==========
    const userPool = new cognito.UserPool(this, 'HalalFinderUserPool', {
      userPoolName: 'HalalFinderUsers',
      selfSignUpEnabled: false,
      signInAliases: {
        email: true,
      },
      passwordPolicy: {
        minLength: 12,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: false,
      },
    });

    // App client (Public - for browser)
    const appClient = userPool.addClient('HalalFinderWebPublic', {
      generateSecret: false,
      authFlows: {
        userPassword: true,
        custom: false,
        adminUserPassword: false,
      },
    });

    // ========== LAB 3: KMS ENCRYPTION ==========
    const kmsKey = new kms.Key(this, 'HalalFinderKey', {
      description: 'KMS key for encrypting restaurant data',
      enableKeyRotation: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    kmsKey.addAlias('halal-finder-encryption-key');

    // ========== LAB 2 & 3: DYNAMODB TABLE ==========
    const restaurantsTable = new dynamodb.Table(this, 'RestaurantsTable', {
      tableName: 'halal-finder-locations',
      partitionKey: {
        name: 'id',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      pointInTimeRecovery: true,
    });

    // ========== LAB 2: LAMBDA AUTHORIZATION & LAB 3: ENCRYPTION ==========
    const lambdaRole = new iam.Role(this, 'LambdaExecutionRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
    });

    // Grant DynamoDB access
    restaurantsTable.grantReadWriteData(lambdaRole);

    // Grant KMS access
    kmsKey.grantEncryptDecrypt(lambdaRole);

    const updateRestaurantFunction = new lambda.Function(this, 'UpdateRestaurantFunction', {
      functionName: 'halal-finder-update-restaurant',
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      role: lambdaRole,
      code: lambda.Code.fromAsset('lambda'),
      environment: {
        TABLE_NAME: restaurantsTable.tableName,
        KMS_KEY_ID: kmsKey.keyId,
      },
    });

    // ========== API GATEWAY ==========
    const api = new apigateway.RestApi(this, 'HalalFinderApi', {
      restApiName: 'Halal Finder API',
      description: 'API for Halal Finder restaurant search',
    });

    const restaurantResource = api.root.addResource('restaurant');
    const updateResource = restaurantResource.addResource('{id}');

    updateResource.addMethod('PUT', new apigateway.LambdaIntegration(updateRestaurantFunction));

    // ========== LAB 4: CLOUDTRAIL AUDIT LOGGING ==========
    const trailBucket = new s3.Bucket(this, 'CloudTrailBucket', {
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const trail = new cloudtrail.Trail(this, 'HalalFinderTrail', {
      bucket: trailBucket,
      isMultiRegionTrail: true,
      enableFileValidation: true,
      includeGlobalServiceEvents: true,
    });

    // ========== OUTPUTS ==========
    new cdk.CfnOutput(this, 'UserPoolId', {
      value: userPool.userPoolId,
      description: 'Cognito User Pool ID',
    });

    new cdk.CfnOutput(this, 'AppClientId', {
      value: appClient.userPoolClientId,
      description: 'Cognito App Client ID',
    });

    new cdk.CfnOutput(this, 'KmsKeyId', {
      value: kmsKey.keyId,
      description: 'KMS Key ID for encryption',
    });

    new cdk.CfnOutput(this, 'DynamoDBTableName', {
      value: restaurantsTable.tableName,
      description: 'DynamoDB table name',
    });

    new cdk.CfnOutput(this, 'ApiEndpoint', {
      value: api.url,
      description: 'API Gateway endpoint',
    });

    new cdk.CfnOutput(this, 'LambdaFunctionName', {
      value: updateRestaurantFunction.functionName,
      description: 'Lambda function name',
    });
  }
}