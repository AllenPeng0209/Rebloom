# Rebloom Security & Privacy Documentation

## Overview

This document outlines the comprehensive security and privacy measures implemented in Rebloom to protect user data and ensure HIPAA compliance for our mental health AI companion app.

---

## Table of Contents

1. [Security Architecture](#security-architecture)
2. [Data Encryption](#data-encryption)
3. [Authentication & Access Control](#authentication--access-control)
4. [HIPAA Compliance](#hipaa-compliance)
5. [Privacy Protection](#privacy-protection)
6. [Data Handling](#data-handling)
7. [Incident Response](#incident-response)
8. [Audit & Monitoring](#audit--monitoring)
9. [Third-Party Security](#third-party-security)
10. [User Rights & Controls](#user-rights--controls)

---

## Security Architecture

### Defense in Depth

Rebloom implements multiple layers of security controls:

#### Application Layer
- **Input Validation**: All user inputs sanitized and validated
- **Output Encoding**: Prevents XSS and injection attacks
- **Authentication**: Multi-factor authentication support
- **Session Management**: Secure session handling with automatic timeout
- **CSRF Protection**: Cross-site request forgery prevention

#### Network Layer
- **TLS 1.3**: All communications encrypted in transit
- **Certificate Pinning**: Prevents man-in-the-middle attacks
- **Network Segmentation**: Isolated production environments
- **Web Application Firewall (WAF)**: Filters malicious traffic
- **DDoS Protection**: Cloudflare protection against attacks

#### Infrastructure Layer
- **Container Security**: Docker containers with minimal attack surface
- **Infrastructure as Code**: Terraform for consistent, secure deployments
- **Network Policies**: Kubernetes network policies restrict traffic
- **Resource Limits**: Prevents resource exhaustion attacks
- **Regular Updates**: Automated security patching

#### Data Layer
- **Encryption at Rest**: AES-256 encryption for stored data
- **Database Security**: Row-level security and encrypted connections
- **Backup Encryption**: All backups encrypted with separate keys
- **Data Minimization**: Only necessary data is collected and stored
- **Data Retention**: Automatic deletion based on retention policies

### Security Controls Framework

Based on NIST Cybersecurity Framework:

**Identify**
- Asset inventory and classification
- Risk assessments and threat modeling
- Security policies and procedures
- Staff security training

**Protect**
- Access controls and authentication
- Data security and encryption
- Information protection processes
- Maintenance and updates

**Detect**
- Anomaly detection and monitoring
- Security event correlation
- Continuous security monitoring
- Malicious activity detection

**Respond**
- Incident response procedures
- Communication protocols
- Analysis and mitigation
- Improvement processes

**Recover**
- Recovery planning and procedures
- Improvement planning
- Communication with stakeholders

---

## Data Encryption

### Encryption at Rest

**Database Encryption**
- **Algorithm**: AES-256-GCM encryption
- **Key Management**: AWS KMS with automatic key rotation
- **Scope**: All user data, conversations, and personal information
- **Implementation**: Transparent data encryption (TDE)

**File Storage Encryption**
- **Voice Messages**: AES-256 encryption before storage
- **Profile Images**: Encrypted with user-specific keys
- **Backups**: Separate encryption keys for backup data
- **Logs**: Encrypted logs with redacted sensitive information

**Application-Level Encryption**
- **Sensitive Fields**: Additional field-level encryption for PHI
- **Conversation Content**: End-to-end encrypted conversations
- **Mood Data**: Encrypted with user-derived keys
- **Safety Plans**: Military-grade encryption for crisis information

### Encryption in Transit

**Client-Server Communication**
- **Protocol**: TLS 1.3 with perfect forward secrecy
- **Certificate Management**: Automated certificate renewal
- **HSTS**: HTTP Strict Transport Security enforced
- **Certificate Pinning**: Mobile apps pin certificates

**Internal Communication**
- **Service Mesh**: Istio with mTLS for service-to-service communication
- **Database Connections**: Encrypted connections only
- **API Gateway**: TLS termination and re-encryption
- **Message Queues**: Encrypted message transport

### Key Management

**Key Hierarchy**
```
Master Key (HSM-protected)
│
├── Data Encryption Keys (DEK)
│   ├── User Data Key
│   ├── Conversation Key
│   └── Voice Message Key
│
├── Transport Keys
│   ├── TLS Certificates
└── Signing Keys
    ├── JWT Signing Keys
    └── API Keys
```

**Key Rotation**
- **Automatic Rotation**: Keys rotated every 90 days
- **Emergency Rotation**: Immediate rotation if compromise suspected
- **Backward Compatibility**: Old keys retained for decryption
- **Audit Trail**: All key operations logged

---

## Authentication & Access Control

### User Authentication

**Multi-Factor Authentication (MFA)**
- **TOTP**: Time-based one-time passwords (Google Authenticator, Authy)
- **SMS**: SMS-based verification (backup method)
- **Push Notifications**: Secure push-based approval
- **Biometric**: Face ID, Touch ID, Fingerprint authentication

**Authentication Flow**
```
1. Username/Password verification
2. Risk assessment (device, location, behavior)
3. MFA challenge (if required)
4. JWT token issuance with claims
5. Session establishment with timeout
```

**Password Security**
- **Requirements**: Minimum 12 characters, complexity rules
- **Hashing**: Argon2id with salt and pepper
- **Breach Detection**: Integration with HaveIBeenPwned
- **History**: Prevents reuse of last 24 passwords

### Access Control Model

**Role-Based Access Control (RBAC)**

**User Roles:**
- **End User**: Access to own data and conversations
- **Support Staff**: Limited access for customer service
- **Clinical Staff**: Access for crisis intervention
- **Developer**: Development environment access only
- **Administrator**: System administration functions
- **Auditor**: Read-only access for compliance audits

**Permission Matrix:**
```
| Resource           | User | Support | Clinical | Developer | Admin | Auditor |
|-------------------|------|---------|----------|-----------|-------|----------|
| Own Conversations | RW   | R       | R        | -         | -     | R       |
| User Profile      | RW   | R       | R        | -         | -     | R       |
| Crisis Data       | RW   | -       | RW       | -         | -     | R       |
| System Logs       | -    | -       | -        | R         | RW    | R       |
| Configuration     | -    | -       | -        | -         | RW    | R       |
```

**Principle of Least Privilege**
- Users granted minimum necessary permissions
- Temporary elevation for specific tasks
- Regular access reviews and cleanup
- Automatic permission expiration

### Session Management

**Session Security**
- **JWT Tokens**: Short-lived access tokens (15 minutes)
- **Refresh Tokens**: Longer-lived refresh tokens (7 days)
- **Token Rotation**: Automatic rotation on refresh
- **Revocation**: Immediate token revocation capability

**Session Monitoring**
- **Concurrent Sessions**: Limited to 3 active sessions per user
- **Location Tracking**: Unusual location alerts
- **Device Fingerprinting**: Suspicious device detection
- **Timeout**: Automatic logout after inactivity

---

## HIPAA Compliance

### Administrative Safeguards

**Security Officer**
- Designated HIPAA Security Officer
- Regular security risk assessments
- Written information security policies
- Staff training and access management

**Workforce Training**
- Initial HIPAA training for all staff
- Annual refresher training
- Role-specific security training
- Incident response training

**Access Management**
- Unique user identification for each user
- Automatic logoff after predetermined time
- Encryption and decryption capabilities
- Role-based access controls

### Physical Safeguards

**Facility Access Controls**
- Data centers with 24/7 physical security
- Biometric access controls
- Video surveillance and monitoring
- Visitor management systems

**Workstation Use**
- Controlled access to workstations
- Automatic screen locks
- Clean desk policy
- Secure disposal of hardware

**Device and Media Controls**
- Encrypted storage devices
- Secure data disposal procedures
- Media tracking and accountability
- Backup storage security

### Technical Safeguards

**Access Control**
- Unique user identification
- Automatic logoff procedures
- Encryption and decryption
- Role-based permissions

**Audit Controls**
- Hardware, software, and procedural mechanisms
- Record and examine activity in information systems
- Regular audit log reviews
- Automated anomaly detection

**Integrity**
- PHI alteration or destruction protection
- Digital signatures and checksums
- Version control and change tracking
- Data validation and verification

**Person or Entity Authentication**
- Verify user identity before access
- Multi-factor authentication
- Certificate-based authentication
- Regular authentication reviews

**Transmission Security**
- End-to-end encryption for PHI transmission
- Network transmission protection
- Secure communication protocols
- Message integrity verification

### Business Associate Agreements (BAA)

**Third-Party Vendors**
All vendors with access to PHI have signed BAAs:
- Cloud infrastructure providers (AWS)
- Monitoring and logging services
- Email and communication services
- Payment processing services

**BAA Requirements**
- Data use limitations
- Safeguard requirements
- Reporting obligations
- Data return or destruction
- Compliance certifications

---

## Privacy Protection

### Privacy by Design

**Core Principles**
1. **Proactive not Reactive**: Privacy built in from the start
2. **Privacy as the Default**: Maximum privacy protection by default
3. **Privacy Embedded into Design**: Privacy considerations in all features
4. **Full Functionality**: Privacy protection doesn't compromise functionality
5. **End-to-End Security**: Secure lifecycles for all data
6. **Visibility and Transparency**: All stakeholders can verify privacy practices
7. **Respect for User Privacy**: User interests paramount

### Data Minimization

**Collection Limitation**
- Only collect data necessary for service delivery
- No collection of sensitive categories without explicit consent
- Regular review of data collection practices
- Automated data collection limits

**Purpose Limitation**
- Data used only for stated purposes
- No secondary use without consent
- Clear purpose statements for all data collection
- Regular purpose alignment reviews

**Storage Limitation**
- Data retained only as long as necessary
- Automatic deletion after retention period
- User-controlled retention settings
- Secure deletion procedures

### Consent Management

**Granular Consent**
Users can consent to different data uses:
- Essential app functionality
- Analytics and improvement
- Research participation
- Marketing communications
- Data sharing with healthcare providers

**Consent Withdrawal**
- Easy consent withdrawal process
- Immediate effect on data processing
- Granular withdrawal options
- Confirmation of withdrawal actions

### Privacy Controls

**User Privacy Dashboard**
- View all collected data
- Manage consent preferences
- Control data sharing settings
- Access privacy settings

**Data Portability**
- Export all personal data
- Standard formats (JSON, CSV)
- Secure download process
- Data integrity verification

**Right to Erasure**
- Delete personal data on request
- Secure deletion procedures
- Verification of deletion
- Exception handling (legal requirements)

---

## Data Handling

### Data Classification

**Classification Levels**

**Highly Sensitive (PHI)**
- Mental health conversations
- Crisis intervention data
- Medical history information
- Treatment plans and goals

**Sensitive**
- Personal identification information
- Contact information
- Behavioral patterns
- Voice recordings

**Internal**
- Usage analytics (anonymized)
- System performance metrics
- Error logs (sanitized)
- Audit trail data

**Public**
- Marketing materials
- Public documentation
- General app information
- Help documentation

### Data Lifecycle Management

**Data Creation**
- Automatic classification upon creation
- Immediate encryption of sensitive data
- Audit logging of data creation
- Consent verification

**Data Processing**
- Purpose-limited processing
- Minimal necessary access
- Processing logs and audit trails
- Quality checks and validation

**Data Storage**
- Encrypted storage for all sensitive data
- Geographic location controls
- Backup and recovery procedures
- Storage optimization and compression

**Data Transmission**
- TLS encryption for all transmissions
- Certificate pinning and validation
- Message integrity verification
- Transmission logging

**Data Deletion**
- Automated deletion based on retention policies
- Secure deletion procedures (overwriting)
- Backup deletion coordination
- Deletion verification and reporting

### Data Processing Activities

**Record of Processing Activities (ROPA)**

**User Account Management**
- **Purpose**: User authentication and account services
- **Data**: Name, email, password hash, preferences
- **Legal Basis**: Contract performance
- **Retention**: Until account deletion + 30 days

**Mental Health Support**
- **Purpose**: AI-powered mental health conversations
- **Data**: Conversation content, mood data, goals
- **Legal Basis**: Consent for health services
- **Retention**: User-controlled, default indefinite

**Crisis Intervention**
- **Purpose**: Safety monitoring and crisis response
- **Data**: Crisis indicators, safety plans, emergency contacts
- **Legal Basis**: Vital interests protection
- **Retention**: 7 years (regulatory requirement)

**Service Improvement**
- **Purpose**: App improvement and research
- **Data**: Usage patterns (anonymized)
- **Legal Basis**: Legitimate interests
- **Retention**: 2 years

---

## Incident Response

### Incident Response Team

**Team Structure**
- **Incident Commander**: Overall response coordination
- **Security Lead**: Technical investigation and remediation
- **Privacy Officer**: Privacy impact assessment
- **Legal Counsel**: Regulatory and legal guidance
- **Communications Lead**: Internal and external communications
- **Clinical Director**: Mental health impact assessment

### Incident Classification

**Severity Levels**

**Critical (P0)**
- Data breach affecting >100 users
- Complete service outage
- Active ongoing attack
- User safety at immediate risk

**High (P1)**
- Data breach affecting <100 users
- Major feature unavailability
- Successful unauthorized access
- Crisis detection system failure

**Medium (P2)**
- Minor data exposure
- Performance degradation
- Failed attack attempts
- Non-critical system failures

**Low (P3)**
- Suspicious activity detected
- Minor configuration issues
- Policy violations
- Enhancement requests

### Response Procedures

**Immediate Response (0-1 hour)**
1. **Incident Detection**: Automated alerts or manual reporting
2. **Initial Assessment**: Severity classification and impact assessment
3. **Team Activation**: Incident response team notification
4. **Containment**: Immediate actions to limit damage
5. **User Safety**: Ensure user safety and crisis support availability

**Short-term Response (1-24 hours)**
1. **Investigation**: Detailed forensic analysis
2. **Impact Assessment**: Full scope of affected users and data
3. **Remediation**: Fix root cause and restore services
4. **Communication**: Internal stakeholder notification
5. **Regulatory Notification**: If required by law (72-hour rule)

**Long-term Response (1-30 days)**
1. **User Notification**: Affected user communications
2. **Regulatory Reporting**: Detailed incident reports
3. **Post-Incident Review**: Lessons learned and improvements
4. **Process Updates**: Update procedures based on findings
5. **Training Updates**: Staff training on new procedures

### Breach Notification

**Regulatory Timeline**
- **72 hours**: Notification to regulatory authorities (GDPR, state AGs)
- **30 days**: Detailed incident report to authorities
- **Without undue delay**: User notifications for high-risk breaches

**User Communication**
```
Breach Notification Template:

Subject: Important Security Notice - Rebloom Data Incident

Dear [User Name],

We are writing to inform you of a security incident that may have affected your personal information on Rebloom.

**What Happened**: [Brief description of incident]

**Information Involved**: [Types of data potentially affected]

**What We're Doing**: [Response and remediation actions]

**What You Should Do**: [Recommended user actions]

**Additional Support**: [Crisis resources and support information]

We sincerely apologize for this incident and are committed to preventing similar issues in the future.
```

---

## Audit & Monitoring

### Security Monitoring

**Real-time Monitoring**
- **SIEM System**: Centralized security event monitoring
- **Behavioral Analytics**: User and entity behavior analytics (UEBA)
- **Threat Intelligence**: Integration with threat intelligence feeds
- **Anomaly Detection**: Machine learning-based anomaly detection

**Monitoring Scope**
- Authentication attempts and failures
- Data access and modifications
- System configuration changes
- Network traffic patterns
- Application performance metrics
- Crisis intervention triggers

**Alert Categories**

**Security Alerts**
- Multiple failed login attempts
- Unusual data access patterns
- Privilege escalation attempts
- Suspicious network traffic

**Privacy Alerts**
- Large data exports
- Unusual data deletion patterns
- Consent withdrawal processing
- Data retention violations

**Operational Alerts**
- System performance issues
- Service availability problems
- Integration failures
- Backup failures

### Audit Logging

**Comprehensive Audit Trail**
All system activities are logged with:
- **Who**: User or system component
- **What**: Specific action performed
- **When**: Timestamp with timezone
- **Where**: Source IP and location
- **Why**: Business context when available

**Log Categories**

**Authentication Logs**
```json
{
  "timestamp": "2024-01-15T20:30:45Z",
  "event_type": "authentication",
  "action": "login_success",
  "user_id": "user-123",
  "source_ip": "192.168.1.100",
  "user_agent": "RebloomApp/1.0.0",
  "mfa_used": true,
  "risk_score": 0.2
}
```

**Data Access Logs**
```json
{
  "timestamp": "2024-01-15T20:31:15Z",
  "event_type": "data_access",
  "action": "conversation_read",
  "user_id": "user-123",
  "resource_id": "conv-456",
  "data_classification": "highly_sensitive",
  "access_method": "api"
}
```

**Privacy Action Logs**
```json
{
  "timestamp": "2024-01-15T20:32:00Z",
  "event_type": "privacy_action",
  "action": "data_export_requested",
  "user_id": "user-123",
  "export_type": "full_data",
  "status": "initiated"
}
```

### Compliance Auditing

**Internal Audits**
- **Quarterly**: Security control effectiveness
- **Semi-annually**: Privacy compliance review
- **Annually**: Comprehensive HIPAA audit
- **Ad-hoc**: Incident-driven audits

**External Audits**
- **SOC 2 Type II**: Annual third-party security audit
- **HIPAA Assessment**: Annual compliance assessment
- **Penetration Testing**: Quarterly external testing
- **Vulnerability Assessment**: Monthly automated scanning

**Audit Reports**
All audits generate:
- Executive summary
- Detailed findings
- Risk ratings
- Remediation recommendations
- Timeline for fixes
- Follow-up requirements

---

## Third-Party Security

### Vendor Management

**Vendor Security Assessment**
All vendors undergo security evaluation:
1. **Initial Assessment**: Security questionnaire and documentation review
2. **Risk Rating**: Classification based on data access and criticality
3. **Contract Requirements**: Security clauses and SLAs
4. **Ongoing Monitoring**: Regular security reviews and updates

**Critical Vendors**

**Cloud Infrastructure (AWS)**
- **Certifications**: SOC 1/2/3, ISO 27001, PCI DSS Level 1, HIPAA eligible
- **Data Residency**: US-only data centers
- **Encryption**: Server-side encryption with customer-managed keys
- **Monitoring**: CloudTrail logging and GuardDuty threat detection

**Database Services (Supabase)**
- **Certifications**: SOC 2 Type II, ISO 27001
- **Encryption**: TLS in transit, AES-256 at rest
- **Access Control**: Row-level security and API access controls
- **Monitoring**: Real-time monitoring and alerting

### Software Supply Chain Security

**Dependency Management**
- **Vulnerability Scanning**: Automated scanning of all dependencies
- **Security Updates**: Regular updates for security patches
- **License Compliance**: Automated license checking
- **Software Bill of Materials (SBOM)**: Comprehensive dependency tracking

**Development Security**
- **Secure Coding**: Security-focused development practices
- **Code Review**: Mandatory security code reviews
- **Static Analysis**: Automated security code analysis
- **Dependency Pinning**: Exact version pinning for reproducible builds

**Container Security**
- **Base Image Security**: Regularly updated minimal base images
- **Vulnerability Scanning**: Automated container vulnerability scanning
- **Image Signing**: Digital signatures for container images
- **Runtime Security**: Runtime threat detection and response

### API Security

**API Gateway Security**
- **Rate Limiting**: Prevents abuse and DoS attacks
- **API Key Management**: Secure API key generation and rotation
- **Request Validation**: Input validation and sanitization
- **Response Filtering**: Prevent data leakage in responses

**OAuth 2.0 / OpenID Connect**
- **Secure Grant Types**: Only secure OAuth flows implemented
- **Scope Limitation**: Minimal necessary scopes
- **Token Security**: Short-lived tokens with secure storage
- **PKCE**: Proof Key for Code Exchange for mobile apps

---

## User Rights & Controls

### GDPR Rights

**Right to Information (Article 13/14)**
- Transparent privacy notices
- Clear data processing explanations
- Contact information for data controller
- Legal basis for processing

**Right of Access (Article 15)**
- View all personal data
- Download data in portable format
- Information about data sources
- Processing purposes and recipients

**Right to Rectification (Article 16)**
- Correct inaccurate personal data
- Complete incomplete data
- Update profile information
- Verify data accuracy

**Right to Erasure (Article 17)**
- Delete personal data on request
- "Right to be forgotten" implementation
- Secure deletion procedures
- Third-party deletion coordination

**Right to Restrict Processing (Article 18)**
- Temporarily stop data processing
- Maintain data but restrict use
- User-controlled processing restrictions
- Clear restriction indicators

**Right to Data Portability (Article 20)**
- Export data in machine-readable format
- Transfer data to other services
- Structured, commonly used formats
- Direct transfer capabilities

**Right to Object (Article 21)**
- Object to processing for specific purposes
- Stop direct marketing
- Opt-out of automated decision making
- Granular objection options

### User Control Interface

**Privacy Dashboard**
Comprehensive privacy controls:

```
📊 PRIVACY DASHBOARD

📋 Data Overview
• Conversations: 1,247 messages
• Mood Entries: 89 entries
• Voice Messages: 23 recordings
• Profile Data: Complete

🔒 Privacy Settings
• Data Sharing: [Disabled]
• Analytics: [Enabled]
• Research: [Disabled]
• Marketing: [Disabled]

📤 Data Requests
• Export Data: Download your data
• Delete Account: Permanent deletion
• Restrict Processing: Limit data use
• Update Information: Correct your data

📞 Contact Options
• Privacy Officer: privacy@rebloom.app
• Data Protection: gdpr@rebloom.app
• Support: support@rebloom.app
```

**Data Export Process**
1. User requests data export
2. Identity verification (MFA)
3. Data compilation (encrypted)
4. Secure download link generation
5. Time-limited download access
6. Download confirmation and cleanup

**Account Deletion Process**
1. User initiates deletion request
2. Confirmation with MFA
3. Grace period (7 days) for reversal
4. Secure data deletion
5. Third-party deletion coordination
6. Deletion confirmation to user

### Consent Management

**Consent Categories**

**Essential (Always Required)**
- Account creation and authentication
- Core app functionality
- Security and fraud prevention
- Legal compliance

**Analytics (Optional)**
- Usage analytics and improvement
- Performance monitoring
- Feature usage tracking
- Error reporting

**Research (Optional)**
- Anonymized research participation
- Mental health research studies
- Algorithm improvement
- Academic collaborations

**Marketing (Optional)**
- Promotional communications
- Product updates and news
- Personalized recommendations
- Third-party marketing

**Consent Interface**
```
⚙️ CONSENT PREFERENCES

🔄 Essential Services
✓ Account Management [Required]
✓ Core App Features [Required]
✓ Security & Safety [Required]

📊 Analytics & Improvement
☐ Usage Analytics [Optional]
☐ Performance Monitoring [Optional]
☐ Crash Reporting [Optional]

🔬 Research Participation
☐ Mental Health Research [Optional]
☐ Algorithm Training [Optional]
☐ Academic Studies [Optional]

📢 Communications
☐ Product Updates [Optional]
☐ Educational Content [Optional]
☐ Marketing Messages [Optional]

[Save Preferences] [More Information]
```

---

## Contact Information

### Security Team
- **Security Officer**: security@rebloom.app
- **Incident Response**: incident@rebloom.app
- **Vulnerability Reports**: security-reports@rebloom.app

### Privacy Team
- **Privacy Officer**: privacy@rebloom.app
- **GDPR Requests**: gdpr@rebloom.app
- **Data Protection**: dpo@rebloom.app

### Compliance Team
- **HIPAA Compliance**: hipaa@rebloom.app
- **Legal Inquiries**: legal@rebloom.app
- **Regulatory Affairs**: compliance@rebloom.app

---

## Conclusion

Rebloom's security and privacy framework represents a comprehensive approach to protecting user data and maintaining the highest standards of mental health data protection. Through defense-in-depth security measures, privacy-by-design principles, and rigorous compliance programs, we ensure that users can trust Rebloom with their most sensitive mental health information.

Our commitment to security and privacy is ongoing, with regular reviews, updates, and improvements based on emerging threats, regulatory changes, and user needs.

---

*This document is current as of January 2024 and is subject to updates based on regulatory changes and security improvements.*

**Version**: 1.0.0  
**Classification**: Internal Use  
**Next Review**: July 2024