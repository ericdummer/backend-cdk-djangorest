import * as cdk from '@aws-cdk/core';
import * as ecs from '@aws-cdk/aws-ecs';
import * as ecr_assets from '@aws-cdk/aws-ecr-assets';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as autoscaling from '@aws-cdk/aws-autoscaling';
import path = require('path');

export class BackendCdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a VPC
    const vpc = new ec2.Vpc(this, 'MyVpc', { maxAzs: 3 });

    // Create an ECS cluster
    const cluster = new ecs.Cluster(this, 'MyCluster', { vpc });

    // Define an ECR asset from the Dockerfile in the source directory
    const dockerImageAsset = new ecr_assets.DockerImageAsset(this, 'MyDockerImage', {
      directory: path.join(__dirname, '../path/to/your/dockerfile'),
    });

    // Create an Auto Scaling group
    const autoScalingGroup = new autoscaling.AutoScalingGroup(this, 'MyAutoScalingGroup', {
      vpc,
      instanceType: new ec2.InstanceType('t3.medium'),
      machineImage: ecs.EcsOptimizedImage.amazonLinux2(),
      desiredCapacity: 2,
    });
    
    const asgCapacityProvider = new ecs.AsgCapacityProvider(this, 'MyAsgCapacityProvider', { 
      autoScalingGroup
    });

    cluster.addAsgCapacityProvider(asgCapacityProvider);
    // // Add Auto Scaling group to the cluster
    // cluster.addAutoScalingGroup(autoScalingGroup);

    // Create an ECS task definition
    const taskDefinition = new ecs.Ec2TaskDefinition(this, 'MyTaskDefinition', {
      networkMode: ecs.NetworkMode.BRIDGE,
    });

    // Add container with the ECR image
    taskDefinition.addContainer('MyContainer', {
      image: ecs.ContainerImage.fromDockerImageAsset(dockerImageAsset),
      memoryLimitMiB: 512,
      // ... other container properties
    });

    // Create EC2 Service
    new ecs.Ec2Service(this, 'MyEc2Service', {
      cluster,
      taskDefinition,
    });

    // Enable IMDSv2 on the Auto Scaling group
    autoScalingGroup.addUserData('echo ECS_AWSVPC_BLOCK_IMDS=true >> /etc/ecs/ecs.config');
  }
}

const app = new cdk.App();
new BackendCdkStack(app, 'MyEc2EcsStack');
