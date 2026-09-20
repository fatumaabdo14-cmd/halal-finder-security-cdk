# Halal Finder - AWS Security Architecture

## Project Summary
Implemented complete CIA Triad security model for restaurant data management application.

## Labs Completed

### ✅ Lab 1: Authentication (Cognito)
- User Pool: HalalFinderUsers
- JWT token generation
- Test user: fatuma@example.com
- Status: TESTED & WORKING ✅

### ✅ Lab 2: Authorization (Lambda)
- JWT validation
- Ownership-based access control
- Returns 403 Forbidden for unauthorized users
- Status: DEPLOYED & WORKING ✅

### ✅ Lab 3: Encryption (KMS)
- KMS key: halal-finder-encryption-key
- Restaurant data encrypted at rest
- Integrated with Lambda
- Status: DEPLOYED & WORKING ✅

### ✅ Lab 4: Audit Logging (CloudTrail)
- All API calls logged automatically
- User actions tracked
- Status: ACTIVE & RECORDING ✅

### ✅ Lab 5: Risk Assessment
- Risks Addressed:
  1. Unauthorized Access → Mitigated by Cognito + JWT
  2. Unauthorized Data Modification → Mitigated by Lambda Authorization
  3. Data Breach → Mitigated by KMS Encryption
  4. Compliance/Audit Trail → Addressed by CloudTrail

- Remaining Risks:
  1. Transport Security (HTTPS/TLS) - Implemented by API Gateway
  2. Network Security - Requires VPC configuration
  3. Access Control Lists - Can be enhanced with IAM policies

- Security Posture: **STRONG** ✅
  - Multi-layer security (Authentication → Authorization → Encryption)
  - Full audit trail
  - Industry best practices implemented

## Security Architecture Flow
User Login
↓
Cognito (Authentication) → JWT Token
↓
Lambda (Authorization) → Verify Ownership → 200/403
↓
KMS (Encryption) → Encrypt Data
↓
DynamoDB (Storage) → Save Encrypted Data
↓
CloudTrail (Audit) → Log Everything
## CIA Triad Coverage
- **Confidentiality** ✅ - KMS Encryption
- **Integrity** ✅ - CloudTrail Logging  
- **Availability** ✅ - DynamoDB Point-in-Time Recovery

## Deployed Resources
- Cognito User Pool: HalalFinderUsers
- Lambda: halal-finder-update-restaurant
- KMS Key: halal-finder-encryption-key
- DynamoDB Table: halal-finder-locations
- CloudTrail: Enabled globally
- API Gateway: REST API endpoint

## Technologies Used
- AWS Cognito (Authentication)
- AWS Lambda (Authorization)
- AWS KMS (Encryption)
- AWS DynamoDB (Data Storage)
- AWS CloudTrail (Audit Logging)
- AWS API Gateway (REST API)
- AWS CDK (Infrastructure as Code - TypeScript)

## Implementation Methods

### Console Deployment ✅
- All resources created and tested
- Screenshots documented
- Working endpoints confirmed

### CDK Deployment (Code)
- Complete TypeScript infrastructure code
- Fully parameterized
- Ready for production
- Repository: halal-finder-security-cdk

## Architecture Diagram
![Architecture](architecture.png)

## What I Learned
1. Authentication vs Authorization differences
2. How JWT tokens work
3. KMS encryption at rest
4. CloudTrail for compliance/audit
5. Infrastructure as Code with CDK
6. AWS security best practices
7. CIA Triad implementation

## Repositories
- **Main Project:** https://github.com/fatumaabdo14-cmd/halal_finder-
- **CDK Project:** https://github.com/fatumaabdo14-cmd/halal-finder-security-cdk
