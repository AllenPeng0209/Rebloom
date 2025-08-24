# HIPAA Compliance Documentation

## Overview

This document outlines Rebloom's comprehensive HIPAA (Health Insurance Portability and Accountability Act) compliance program for our mental health AI companion app.

---

## HIPAA Compliance Status

✅ **Covered Entity Status**: Rebloom operates as a HIPAA-covered entity for mental health services

✅ **Business Associate Agreements**: All third-party vendors with PHI access have signed BAAs

✅ **Security Rule Compliance**: All required administrative, physical, and technical safeguards implemented

✅ **Privacy Rule Compliance**: PHI collection, use, and disclosure policies in place

✅ **Breach Notification Rule**: Incident response procedures meet 72-hour notification requirements

---

## Administrative Safeguards (§164.308)

### Security Officer (§164.308(a)(2))

**Assigned Security Officer**: Dr. Sarah Johnson, Chief Privacy Officer
- **Contact**: privacy@rebloom.app
- **Responsibilities**: Overall HIPAA compliance, policy development, staff training
- **Training**: Certified in HIPAA Security and Privacy Rules

**Security Responsibilities**:
- Conduct security risk assessments
- Develop and maintain security policies
- Oversee workforce training programs
- Monitor compliance with security procedures

### Assigned Security Responsibilities (§164.308(a)(3))

**Workforce Security Matrix**:
```
Role                    | PHI Access Level | Training Required | Background Check
-----------------------|-------------------|-------------------|-----------------
CEO/Leadership         | Administrative    | Annual            | Yes
Security Officer       | Full Access       | Bi-annual         | Yes
Developers            | Anonymized Only   | Initial + Annual  | Yes
Support Staff         | Limited/Logged    | Initial + Annual  | Yes
Clinical Staff        | Treatment PHI     | Specialized       | Yes
Interns/Contractors   | Supervised Only   | Before Access     | Yes
```

### Information System Activity Review (§164.308(a)(1)(ii)(D))

**Audit Procedures**:
- **Daily**: Automated log analysis for anomalies
- **Weekly**: Security incident review
- **Monthly**: Access control review
- **Quarterly**: Comprehensive security assessment
- **Annually**: Full HIPAA risk assessment

**Audit Trail Requirements**:
- User authentication events
- PHI access, modification, and deletion
- System configuration changes
- Backup and recovery operations
- Security incident investigations

### Workforce Training and Access Management (§164.308(a)(5))

**Training Program**:

**Initial Training (40 hours)**:
- HIPAA Privacy and Security Rules
- PHI handling procedures
- Incident response protocols
- Mental health confidentiality laws
- Crisis intervention procedures

**Annual Refresher Training (8 hours)**:
- Policy updates and changes
- New threat awareness
- Incident case studies
- Technology updates

**Specialized Training**:
- **Clinical Staff**: 20 additional hours on therapy confidentiality
- **Developers**: 16 additional hours on secure coding practices
- **Support Staff**: 12 additional hours on customer PHI handling

**Access Management Process**:
1. **New Employee**: Background check → Training → Role-based access assignment
2. **Access Review**: Quarterly review of access permissions
3. **Termination**: Immediate access revocation upon employment end
4. **Role Changes**: Access modification within 24 hours

### Contingency Plan (§164.308(a)(7))

**Data Backup Plan**:
- **Frequency**: Daily automated backups
- **Storage**: Encrypted backups in geographically separated locations
- **Testing**: Monthly backup integrity verification
- **Recovery Time Objective (RTO)**: 4 hours
- **Recovery Point Objective (RPO)**: 1 hour

**Disaster Recovery Procedures**:
```
Incident Type          | Response Time | Recovery Steps
----------------------|---------------|------------------
System Outage         | 15 minutes    | Failover to backup systems
Data Corruption       | 30 minutes    | Restore from validated backup
Security Breach       | Immediate     | Isolate, assess, notify
Natural Disaster      | 4 hours       | Activate alternate site
Cyber Attack          | Immediate     | Disconnect, assess, rebuild
```

### Evaluation (§164.308(a)(8))

**Regular Compliance Evaluation**:
- **Internal Audits**: Quarterly
- **External Audits**: Annual (SOC 2 Type II)
- **Penetration Testing**: Semi-annual
- **Vulnerability Assessments**: Monthly
- **Risk Assessments**: Annual or after significant changes

**Evaluation Criteria**:
- Policy adherence rates
- Security incident frequency and severity
- User access appropriateness
- System performance and availability
- Training completion rates

---

## Physical Safeguards (§164.310)

### Facility Access Controls (§164.310(a)(1))

**Data Center Security** (AWS/Cloud Provider):
- **Physical Security**: 24/7 security personnel, biometric access
- **Environmental Controls**: Fire suppression, climate control
- **Power Systems**: Redundant power supplies and generators
- **Network Security**: Isolated network segments

**Office Security**:
- **Access Control**: Key card access system with audit logs
- **Visitor Management**: Escorted visitors, visitor logs
- **CCTV Surveillance**: 24/7 monitoring with 90-day retention
- **Clean Desk Policy**: No PHI left unattended

### Workstation Use (§164.310(b))

**Workstation Security Standards**:
- **Automatic Lock**: 5-minute inactivity timeout
- **Screen Privacy**: Privacy screens for public areas
- **Endpoint Protection**: Antivirus, anti-malware, firewall
- **Remote Work**: VPN required, encrypted connections only

**Workstation Configuration**:
```yaml
Security Requirements:
  - Full disk encryption (BitLocker/FileVault)
  - Automatic updates enabled
  - Password complexity enforced
  - USB ports restricted
  - Camera/microphone access controlled
  - Personal software installation blocked
```

### Device and Media Controls (§164.310(d)(1))

**Media Handling Procedures**:

**Portable Devices**:
- **Encryption**: All portable devices encrypted (AES-256)
- **Inventory**: Centralized device tracking system
- **Remote Wipe**: Capability for lost/stolen devices
- **Access Controls**: Multi-factor authentication required

**Data Disposal**:
- **Digital Media**: 3-pass secure wipe (DoD 5220.22-M standard)
- **Physical Media**: Certified destruction with certificates
- **Paper Records**: Cross-cut shredding, destruction certificates
- **Verification**: Disposal completion verification required

---

## Technical Safeguards (§164.312)

### Access Control (§164.312(a)(1))

**User Authentication System**:

**Multi-Factor Authentication**:
- **Primary**: Username + Password (minimum 12 characters)
- **Secondary**: TOTP (Time-based One-Time Password)
- **Biometric**: Face ID/Touch ID for mobile devices
- **Backup**: SMS verification (encrypted)

**Role-Based Access Control (RBAC)**:
```
Role              | PHI Access           | System Access       | Approval Required
------------------|---------------------|--------------------|-----------------
Patient          | Own records only    | App functionality  | Self-registration
Clinician        | Assigned patients   | Clinical tools     | Clinical Director
Support Tier 1   | View only (logged)  | Support systems    | Support Manager
Support Tier 2   | Limited modify      | Admin tools        | Security Officer
Developer        | Anonymized test     | Development env    | Tech Lead
Administrator    | System admin        | Full system        | CEO + Security Officer
```

**Automatic Logoff**:
- **Web Sessions**: 30 minutes inactivity
- **Mobile Apps**: 15 minutes inactivity
- **Administrative Systems**: 10 minutes inactivity
- **Clinical Systems**: 5 minutes inactivity

### Audit Controls (§164.312(b))

**Comprehensive Audit Logging**:

**Logged Events**:
```json
{
  "authentication_events": [
    "login_success",
    "login_failure",
    "logout",
    "password_change",
    "account_lockout"
  ],
  "data_access_events": [
    "phi_view",
    "phi_create",
    "phi_modify",
    "phi_delete",
    "phi_export"
  ],
  "system_events": [
    "privilege_escalation",
    "configuration_change",
    "backup_operation",
    "system_maintenance"
  ],
  "security_events": [
    "intrusion_attempt",
    "malware_detection",
    "policy_violation",
    "unusual_activity"
  ]
}
```

**Log Analysis and Monitoring**:
- **Real-time Monitoring**: SIEM system with automated alerting
- **Daily Reviews**: Automated analysis with exception reporting
- **Weekly Reports**: Summary of access patterns and anomalies
- **Long-term Storage**: 7-year retention for HIPAA compliance

### Integrity (§164.312(c)(1))

**Data Integrity Protection**:

**Electronic PHI Integrity**:
- **Digital Signatures**: Cryptographic signing for critical data
- **Checksums**: MD5/SHA-256 verification for data transfers
- **Version Control**: Complete change history with rollback capability
- **Database Integrity**: Foreign key constraints, data validation

**Integrity Monitoring**:
```python
# Example integrity check process
def verify_phi_integrity():
    """
    Daily PHI integrity verification process
    """
    checks = {
        'database_checksums': verify_database_integrity(),
        'file_signatures': verify_file_signatures(),
        'backup_integrity': verify_backup_completeness(),
        'transmission_logs': verify_secure_transmissions()
    }
    
    if not all(checks.values()):
        trigger_integrity_alert(checks)
    
    return generate_integrity_report(checks)
```

### Transmission Security (§164.312(e)(1))

**Secure Transmission Requirements**:

**Encryption Standards**:
- **In Transit**: TLS 1.3 with perfect forward secrecy
- **End-to-End**: AES-256-GCM encryption for sensitive data
- **VPN Access**: IPSec or OpenVPN for remote access
- **API Communications**: Certificate pinning and mutual TLS

**Network Security**:
```yaml
Network Segmentation:
  production:
    subnets:
      - web_tier: 10.0.1.0/24
      - app_tier: 10.0.2.0/24  
      - data_tier: 10.0.3.0/24
    access_controls:
      - web_to_app: https/443 only
      - app_to_data: encrypted_db/5432 only
      - external: firewall_filtered

Security_Groups:
  web:
    inbound: [80, 443]
    outbound: [80, 443, 5432]
  app:
    inbound: [443 from web]
    outbound: [5432 to db, 443 to external apis]
  data:
    inbound: [5432 from app]
    outbound: []
```

---

## Business Associate Agreements (BAAs)

### Current Business Associates

**Cloud Infrastructure Partners**:

**Amazon Web Services (AWS)**
- **Services**: EC2, RDS, S3, CloudWatch
- **BAA Status**: ✅ Signed and current
- **PHI Access**: Infrastructure hosting, encrypted storage
- **Security Measures**: SOC 2 Type II, ISO 27001 certified

**Supabase (Database Services)**
- **Services**: PostgreSQL hosting, real-time subscriptions
- **BAA Status**: ✅ Signed and current
- **PHI Access**: Database operations, backups
- **Security Measures**: SOC 2 Type II, HIPAA-eligible services

### BAA Requirements Checklist

**Standard BAA Terms**:
- [ ] **Use Limitation**: PHI used only for permitted purposes
- [ ] **Safeguard Requirements**: Administrative, physical, technical safeguards
- [ ] **Reporting**: Breach notification within 24 hours
- [ ] **Subcontractor Agreements**: Ensure downstream BAAs
- [ ] **Access and Amendment**: Provide access to PHI upon request
- [ ] **Return/Destruction**: Return or destroy PHI at contract end
- [ ] **Audit Rights**: Allow covered entity audits

**Additional Security Requirements**:
```yaml
Minimum_Security_Standards:
  encryption:
    at_rest: "AES-256"
    in_transit: "TLS 1.3+"
  access_control:
    authentication: "Multi-factor required"
    authorization: "Role-based, least privilege"
  monitoring:
    logging: "Comprehensive audit trails"
    alerting: "Real-time security monitoring"
  incident_response:
    notification: "24 hours maximum"
    reporting: "Detailed incident reports"
```

---

## Breach Notification Procedures

### Breach Definition (§164.402)

**HIPAA Breach Criteria**:
1. **Acquisition, access, use, or disclosure** of PHI
2. **Not permitted** under the Privacy Rule
3. **Compromises security or privacy** of PHI
4. **Low probability** that PHI has been compromised (exception)

**Risk Assessment Factors**:
- Nature and extent of PHI involved
- Person who used/received the PHI
- Whether PHI was actually acquired/viewed
- Extent to which risk has been mitigated

### Incident Response Timeline

**Immediate Response (0-4 hours)**:
1. **Detection**: Automated alerts or manual discovery
2. **Assessment**: Initial severity and scope evaluation
3. **Containment**: Immediate steps to limit exposure
4. **Team Activation**: Security and privacy team notification
5. **Documentation**: Incident tracking and evidence preservation

**Short-term Response (4-24 hours)**:
1. **Investigation**: Detailed forensic analysis
2. **Risk Assessment**: Formal breach determination
3. **User Safety**: Ensure continued crisis support availability
4. **Internal Notification**: Leadership and legal team briefing
5. **Preliminary Report**: Initial findings documentation

**Regulatory Notification (24-72 hours)**:
1. **HHS Notification**: Electronic submission via HHS website
2. **State Notifications**: As required by state breach laws
3. **Business Associate Notification**: If BA involved in breach
4. **Documentation**: Complete breach notification forms

**Individual Notification (≤60 days)**:
1. **Patient Notification**: Written notice by mail
2. **Substitute Notice**: If contact information insufficient
3. **Media Notice**: If >500 individuals in a state/jurisdiction
4. **Website Notice**: Prominent posting for 90 days minimum

### Breach Notification Templates

**Individual Notification Letter**:
```
[Letterhead]

Dear [Patient Name],

We are writing to inform you of a data security incident that may have involved some of your protected health information at Rebloom.

WHAT HAPPENED:
[Brief description of incident, date discovered, and how]

WHAT INFORMATION WAS INVOLVED:
[Specific types of information potentially affected]

WHAT WE ARE DOING:
[Steps taken to investigate and prevent future occurrences]

WHAT YOU CAN DO:
[Specific recommendations for individual]

• Monitor your accounts for unusual activity
• Consider placing a fraud alert with credit bureaus
• Review your mental health provider statements
• Contact us with questions at privacy@rebloom.app

Your privacy and the security of your information are of utmost importance to us. We sincerely apologize for this incident and any inconvenience it may cause.

Sincerely,
[Privacy Officer Signature]
Dr. Sarah Johnson
Chief Privacy Officer
```

---

## Risk Assessment and Management

### Annual HIPAA Risk Assessment

**Risk Assessment Methodology** (NIST 800-30):

**Step 1: System Characterization**
- Identify all systems processing PHI
- Document data flows and storage locations
- Catalog all workforce members with PHI access
- Map business associate relationships

**Step 2: Threat Identification**
```yaml
Threat_Categories:
  external_attacks:
    - ransomware
    - data_theft
    - social_engineering
    - ddos_attacks
  
  internal_threats:
    - unauthorized_access
    - data_misuse
    - accidental_disclosure
    - policy_violations
  
  environmental:
    - natural_disasters
    - power_outages
    - hardware_failures
    - network_disruptions
```

**Step 3: Vulnerability Assessment**
- Technical vulnerability scanning
- Administrative policy gap analysis
- Physical security assessment
- Workforce training evaluation

**Step 4: Impact Analysis**
```
Impact Levels:
  HIGH (7-10):
    - Patient safety compromised
    - Large-scale PHI exposure (>500 individuals)
    - Regulatory penalties likely
    - Significant reputation damage
  
  MEDIUM (4-6):
    - Limited PHI exposure (<500 individuals)
    - Service disruption possible
    - Investigation required
    - Moderate reputation impact
  
  LOW (1-3):
    - Minimal PHI exposure
    - Internal impact only
    - Standard response adequate
    - Limited business impact
```

### Risk Treatment Strategies

**Risk Response Options**:

**Accept**:
- Residual risk within tolerance
- Cost of mitigation exceeds benefit
- Documented risk acceptance by management

**Mitigate**:
- Implement security controls
- Enhance monitoring and detection
- Improve staff training and procedures

**Transfer**:
- Cyber insurance coverage
- Contractual risk allocation
- Business associate agreements

**Avoid**:
- Eliminate risky processes
- Modify system architecture
- Change business procedures

---

## Privacy Policies and Procedures

### Notice of Privacy Practices

**Patient Rights Under HIPAA**:

✅ **Right to Notice**: Receive notice of privacy practices

✅ **Right to Access**: Obtain copy of health information

✅ **Right to Amendment**: Request changes to health information

✅ **Right to Restriction**: Request limits on use/disclosure

✅ **Right to Alternative Communication**: Request confidential communications

✅ **Right to Accounting**: Receive list of disclosures

✅ **Right to File Complaints**: File HIPAA complaints

### Uses and Disclosures

**Permitted Uses (With Patient Authorization)**:
- AI conversation analysis and response generation
- Mood tracking and pattern analysis
- Crisis intervention and safety monitoring
- Quality improvement and service enhancement
- Research participation (with specific consent)

**Required Disclosures**:
- To the individual upon request
- To HHS for compliance investigations
- Court orders and legal proceedings
- Public health reporting requirements

**Permitted Disclosures (Without Authorization)**:
- Emergency situations and imminent danger
- Child abuse or elder abuse reporting
- Law enforcement with appropriate warrant
- Public health authorities for disease prevention

### Minimum Necessary Standard

**Internal Access Controls**:
```yaml
Role_Based_Access:
  patient:
    phi_access: "own_records_only"
    features: ["chat", "mood_tracking", "resources"]
  
  support_agent:
    phi_access: "view_only_logged"
    features: ["limited_profile", "technical_support"]
    restrictions: ["no_clinical_content"]
  
  clinician:
    phi_access: "assigned_patients"
    features: ["full_clinical_tools", "crisis_intervention"]
    supervision: "clinical_director"
  
  administrator:
    phi_access: "aggregate_anonymized"
    features: ["system_management", "reporting"]
    logging: "all_actions_logged"
```

---

## Compliance Monitoring and Auditing

### Internal Audit Program

**Quarterly Compliance Audits**:

**Q1 Audit Focus**: Administrative Safeguards
- Workforce training records review
- Access control effectiveness
- Policy compliance assessment
- Incident response testing

**Q2 Audit Focus**: Physical Safeguards
- Facility security assessment
- Workstation security review
- Media handling procedures
- Environmental controls testing

**Q3 Audit Focus**: Technical Safeguards
- Access control system review
- Audit log analysis
- Encryption implementation verification
- Transmission security testing

**Q4 Audit Focus**: Business Associate Management
- BAA compliance verification
- Third-party security assessments
- Vendor risk management review
- Contract compliance monitoring

### External Compliance Verification

**Annual SOC 2 Type II Audit**:
- Independent security control assessment
- Operational effectiveness testing
- Management assertion validation
- Third-party attestation report

**HIPAA Security Assessment**:
- Comprehensive regulation compliance review
- Gap analysis and remediation recommendations
- Industry benchmark comparison
- Compliance roadmap development

### Key Performance Indicators (KPIs)

**Security Metrics**:
```yaml
Security_KPIs:
  access_control:
    - unauthorized_access_attempts: "< 0.1% of total logins"
    - access_review_completion: "100% within 30 days"
    - account_provisioning_time: "< 24 hours"
  
  incident_response:
    - detection_time: "< 15 minutes average"
    - containment_time: "< 1 hour for high severity"
    - notification_compliance: "100% within regulatory timelines"
  
  training_compliance:
    - initial_training_completion: "100% before PHI access"
    - annual_refresher_completion: "100% by due date"
    - specialized_training_completion: "100% for applicable roles"
```

**Privacy Metrics**:
```yaml
Privacy_KPIs:
  patient_rights:
    - access_request_fulfillment: "100% within 30 days"
    - amendment_request_processing: "100% within 60 days"
    - complaint_resolution: "100% within 30 days"
  
  data_handling:
    - minimum_necessary_compliance: "100% of disclosures"
    - authorization_validity: "100% before use/disclosure"
    - data_retention_compliance: "100% within policy limits"
```

---

## Incident Examples and Lessons Learned

### Case Study 1: Phishing Attack

**Incident Summary**:
- **Date**: March 15, 2024
- **Type**: Phishing email with malicious link
- **Impact**: 1 employee clicked link, no PHI accessed
- **Resolution**: 4 hours to full containment

**Response Actions**:
1. **Immediate**: Employee reported suspicious email
2. **Containment**: IT isolated affected workstation
3. **Investigation**: Forensic analysis confirmed no PHI access
4. **Remediation**: Enhanced email filtering, additional training

**Lessons Learned**:
- ✅ Employee training program effective (self-reporting)
- ✅ Incident response procedures worked well
- 🔄 Need more sophisticated email security
- 🔄 Implement simulated phishing exercises

### Case Study 2: Backup System Failure

**Incident Summary**:
- **Date**: June 8, 2024
- **Type**: Automated backup system malfunction
- **Impact**: 48-hour gap in backup coverage
- **Resolution**: Manual backup initiated, system repaired

**Response Actions**:
1. **Detection**: Automated monitoring alert
2. **Assessment**: No data loss, continuity maintained
3. **Correction**: Manual backup, vendor support engaged
4. **Prevention**: Enhanced monitoring, redundant systems

**Lessons Learned**:
- ✅ Monitoring systems effective for early detection
- ✅ Manual procedures successfully maintained continuity
- 🔄 Need redundant backup systems
- 🔄 Enhance vendor SLA requirements

---

## Compliance Contacts and Resources

### Internal Contacts

**Privacy Officer**
- **Name**: Dr. Sarah Johnson
- **Title**: Chief Privacy Officer
- **Email**: privacy@rebloom.app
- **Phone**: +1-555-0199 (24/7 for emergencies)

**Security Officer**
- **Name**: Michael Chen
- **Title**: Chief Information Security Officer
- **Email**: security@rebloom.app
- **Phone**: +1-555-0188

**Compliance Team**
- **General**: compliance@rebloom.app
- **HIPAA Inquiries**: hipaa@rebloom.app
- **Legal**: legal@rebloom.app

### External Resources

**Regulatory Bodies**:
- **HHS Office for Civil Rights**: https://www.hhs.gov/ocr/
- **HIPAA Complaints**: https://ocrportal.hhs.gov/ocr/smartscreen/main.jsf
- **State Health Departments**: [Varies by state]

**Professional Organizations**:
- **HIMSS**: Healthcare Information Management Systems Society
- **AHIMA**: American Health Information Management Association
- **IAPP**: International Association of Privacy Professionals

### Emergency Contacts

**24/7 Incident Response**:
- **Primary**: +1-555-0199
- **Secondary**: +1-555-0188
- **Email**: incident@rebloom.app

**Legal Counsel**:
- **Primary**: Johnson & Associates Healthcare Law
- **Contact**: +1-555-0177
- **Emergency**: +1-555-0166

---

## Appendices

### Appendix A: Risk Assessment Template

```
HIPAA RISK ASSESSMENT WORKSHEET

Asset: ________________________________
Date: _________________________________
Assessor: _____________________________

THREAT ANALYSIS:
Threat Source: _________________________
Threat Action: _________________________
Vulnerability: ________________________
Likelihood (1-10): ____________________
Impact (1-10): _________________________
Overall Risk Score: ____________________

CURRENT CONTROLS:
☐ Administrative: _____________________
☐ Physical: ___________________________
☐ Technical: __________________________

RECOMMENDED ACTIONS:
☐ Accept Risk
☐ Mitigate Risk: ______________________
☐ Transfer Risk: _______________________
☐ Avoid Risk: _________________________

TIMELINE: ______________________________
RESPONSIBLE PARTY: ______________________
FOLLOW-UP DATE: _________________________
```

### Appendix B: Incident Report Template

```
HIPAA INCIDENT REPORT

INCIDENT DETAILS:
Date/Time Discovered: ___________________
Date/Time Occurred: ____________________
Reported By: ___________________________
Incident Type: _________________________

DESCRIPTION:
_______________________________________
_______________________________________

PHI INVOLVED:
☐ No PHI involved
☐ PHI potentially involved
☐ PHI confirmed involved

Number of Individuals Affected: __________
Types of Information: __________________

IMMEDIATE ACTIONS TAKEN:
_______________________________________
_______________________________________

RISK ASSESSMENT:
☐ Low Risk (no further action required)
☐ Medium Risk (additional investigation needed)
☐ High Risk (breach notification may be required)

INVESTIGATION FINDINGS:
_______________________________________
_______________________________________

FINAL DETERMINATION:
☐ Not a breach
☐ Breach requiring notification
☐ Breach not requiring notification

PREVENTIVE MEASURES:
_______________________________________
_______________________________________

Completed By: ___________________________
Date: __________________________________
Privacy Officer Review: _________________
```

---

## Conclusion

This HIPAA compliance documentation demonstrates Rebloom's comprehensive commitment to protecting patient health information in accordance with federal regulations. Our multi-layered approach includes administrative policies, physical safeguards, technical controls, and ongoing monitoring to ensure the privacy and security of all mental health data.

Regular reviews and updates of this documentation ensure continued compliance with evolving regulations and industry best practices.

---

*Document Version: 2.1*  
*Last Updated: January 15, 2024*  
*Next Review Date: July 15, 2024*  
*Classification: Internal Use Only*

For questions about this document, contact: hipaa@rebloom.app