import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

export interface EfsProps {
  vpc: cdk.aws_ec2.IVpc;
}

export class Efs extends Construct {
  constructor(scope: Construct, id: string, props: EfsProps) {
    super(scope, id);

    const securityGroup = new cdk.aws_ec2.SecurityGroup(this, "Sg", {
      vpc: props.vpc,
    });
    securityGroup.addIngressRule(
      cdk.aws_ec2.Peer.ipv4(props.vpc.vpcCidrBlock),
      cdk.aws_ec2.Port.tcp(2049)
    );

    new cdk.aws_efs.FileSystem(this, "Default", {
      vpc: props?.vpc,
      performanceMode: cdk.aws_efs.PerformanceMode.GENERAL_PURPOSE,
      throughputMode: cdk.aws_efs.ThroughputMode.ELASTIC,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      securityGroup,
      fileSystemPolicy: new cdk.aws_iam.PolicyDocument({
        statements: [
          new cdk.aws_iam.PolicyStatement({
            actions: [
              "elasticfilesystem:ClientWrite",
              "elasticfilesystem:ClientMount",
              "elasticfilesystem:ClientRootAccess",
            ],
            principals: [new cdk.aws_iam.AnyPrincipal()],
            resources: ["*"],
            conditions: {
              Bool: {
                "elasticfilesystem:AccessedViaMountTarget": "true",
              },
            },
          }),
        ],
      }),
    });
  }
}
