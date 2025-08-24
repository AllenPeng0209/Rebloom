# Rebloom Architecture Diagrams

## System Architecture Diagrams

### 1. High-Level System Architecture

```mermaid
graph TB
    subgraph "Client Tier"
        iOS[iOS App<br/>React Native]
        Android[Android App<br/>React Native] 
        Web[Web Portal<br/>Next.js]
        TherapistUI[Therapist Dashboard<br/>React]
    end
    
    subgraph "Edge/CDN"
        CDN[CloudFlare CDN]
        WAF[Web Application Firewall]
    end
    
    subgraph "API Gateway Tier"
        ALB[Application Load Balancer]
        Gateway[API Gateway<br/>Kong]
        RateLimit[Rate Limiter]
        Auth[Auth Middleware]
    end
    
    subgraph "Service Mesh"
        Istio[Istio Service Mesh]
    end
    
    subgraph "Application Services"
        UserSvc[User Service<br/>Node.js]
        ChatSvc[Chat Service<br/>Node.js] 
        AISvc[AI/ML Service<br/>Python]
        SafetySvc[Safety Service<br/>Node.js]
        AnalyticsSvc[Analytics Service<br/>Python]
        EncryptSvc[Encryption Service<br/>Node.js]
        MemorySvc[Memory Service<br/>Node.js]
        SyncSvc[Offline Sync Service<br/>Node.js]
        IntegrationSvc[Integration Service<br/>Node.js]
        MonitorSvc[Monitoring Service<br/>Node.js]
    end
    
    subgraph "Data Tier"
        PrimaryDB[(PostgreSQL<br/>Primary Database)]
        ReplicaDB[(PostgreSQL<br/>Read Replicas)]
        RedisCluster[(Redis Cluster<br/>Cache + Sessions)]
        VectorDB[(Pinecone<br/>Vector Database)]
        S3[(S3<br/>File Storage)]
        LocalDB[(SQLite<br/>Local Storage)]
    end
    
    subgraph "External Integrations"
        BailianAI[Bailian AI API]
        EmergencyAPI[Emergency Services API]
        HealthcareAPI[Healthcare Provider APIs]
        InsuranceAPI[Insurance APIs]
        WellnessAPIs[Wellness App APIs]
    end
    
    subgraph "Infrastructure"
        EKS[Amazon EKS<br/>Kubernetes Cluster]
        Monitoring[DataDog<br/>Monitoring & Alerts]
        Logging[CloudWatch<br/>Centralized Logging]
        Backup[Automated Backup<br/>Cross-Region]
    end
    
    %% Client to Edge
    iOS --> CDN
    Android --> CDN
    Web --> CDN
    TherapistUI --> CDN
    
    %% Edge to Gateway
    CDN --> WAF
    WAF --> ALB
    ALB --> Gateway
    
    %% Gateway processing
    Gateway --> RateLimit
    RateLimit --> Auth
    Auth --> Istio
    
    %% Service Mesh to Services
    Istio --> UserSvc
    Istio --> ChatSvc
    Istio --> AISvc
    Istio --> SafetySvc
    Istio --> AnalyticsSvc
    Istio --> EncryptSvc
    Istio --> MemorySvc
    Istio --> SyncSvc
    Istio --> IntegrationSvc
    Istio --> MonitorSvc
    
    %% Services to Data
    UserSvc --> PrimaryDB
    UserSvc --> RedisCluster
    ChatSvc --> PrimaryDB
    ChatSvc --> RedisCluster
    ChatSvc --> VectorDB
    AISvc --> VectorDB
    AISvc --> RedisCluster
    SafetySvc --> PrimaryDB
    AnalyticsSvc --> ReplicaDB
    MemorySvc --> VectorDB
    SyncSvc --> PrimaryDB
    SyncSvc --> RedisCluster
    
    %% File Storage
    ChatSvc --> S3
    UserSvc --> S3
    
    %% Local Storage (Clients)
    iOS --> LocalDB
    Android --> LocalDB
    
    %% External Services
    AISvc --> BailianAI
    SafetySvc --> EmergencyAPI
    IntegrationSvc --> HealthcareAPI
    IntegrationSvc --> InsuranceAPI
    IntegrationSvc --> WellnessAPIs
    
    %% Infrastructure
    EKS -.-> UserSvc
    EKS -.-> ChatSvc
    EKS -.-> AISvc
    Monitoring -.-> EKS
    Logging -.-> EKS
    Backup -.-> PrimaryDB
    Backup -.-> S3
    
    classDef client fill:#e1f5fe
    classDef gateway fill:#f3e5f5
    classDef service fill:#e8f5e8
    classDef data fill:#fff3e0
    classDef external fill:#fce4ec
    classDef infra fill:#f1f8e9
    
    class iOS,Android,Web,TherapistUI client
    class CDN,WAF,ALB,Gateway,RateLimit,Auth gateway
    class UserSvc,ChatSvc,AISvc,SafetySvc,AnalyticsSvc,EncryptSvc,MemorySvc,SyncSvc,IntegrationSvc,MonitorSvc service
    class PrimaryDB,ReplicaDB,RedisCluster,VectorDB,S3,LocalDB data
    class BailianAI,EmergencyAPI,HealthcareAPI,InsuranceAPI,WellnessAPIs external
    class EKS,Monitoring,Logging,Backup infra
```

### 2. Security Architecture

```mermaid
graph TB
    subgraph "Client Security"
        ClientEnc[Client-Side Encryption]
        Biometric[Biometric Auth]
        LocalKey[Local Key Storage]
        DeviceAttest[Device Attestation]
    end
    
    subgraph "Network Security"
        TLS[TLS 1.3 Encryption]
        CertPin[Certificate Pinning]
        MTLS[Mutual TLS]
        WAF[Web Application Firewall]
    end
    
    subgraph "Authentication Layer"
        MFA[Multi-Factor Authentication]
        JWT[JWT Tokens]
        OAuth[OAuth 2.0 / OIDC]
        RiskAuth[Risk-Based Auth]
    end
    
    subgraph "Authorization Layer"
        RBAC[Role-Based Access Control]
        ABAC[Attribute-Based Access Control]
        PolicyEngine[Policy Engine]
        AccessMatrix[Access Control Matrix]
    end
    
    subgraph "Application Security"
        InputValid[Input Validation]
        SQLInject[SQL Injection Protection]
        XSSProtect[XSS Protection]
        CSRFProtect[CSRF Protection]
        RateLimit[Rate Limiting]
    end
    
    subgraph "Data Security"
        E2EEncryption[End-to-End Encryption]
        FieldEncryption[Field-Level Encryption]
        KeyRotation[Automatic Key Rotation]
        HSM[Hardware Security Module]
        DataMasking[Data Masking]
    end
    
    subgraph "Infrastructure Security"
        VPC[Private VPC]
        SecurityGroups[Security Groups]
        NetworkACL[Network ACLs]
        Bastion[Bastion Host]
        VPN[Site-to-Site VPN]
    end
    
    subgraph "Compliance & Audit"
        AuditLog[Comprehensive Audit Logs]
        HIPAA[HIPAA Compliance]
        GDPR[GDPR Compliance]
        SOC2[SOC 2 Type II]
        PenTest[Regular Penetration Testing]
    end
    
    subgraph "Crisis Security"
        CrisisDetect[Crisis Detection ML]
        RiskAssess[Risk Assessment Engine]
        EmergencyProto[Emergency Protocols]
        ProfessionalAlert[Professional Alerts]
    end
    
    subgraph "Monitoring & Response"
        SIEM[Security Information Event Management]
        Intrusion[Intrusion Detection]
        Anomaly[Anomaly Detection]
        IncidentResp[Incident Response]
        ThreatIntel[Threat Intelligence]
    end
    
    %% Security Flow
    ClientEnc --> E2EEncryption
    Biometric --> MFA
    LocalKey --> KeyRotation
    
    TLS --> E2EEncryption
    CertPin --> TLS
    MTLS --> TLS
    
    MFA --> JWT
    OAuth --> JWT
    RiskAuth --> MFA
    
    RBAC --> PolicyEngine
    ABAC --> PolicyEngine
    PolicyEngine --> AccessMatrix
    
    InputValid --> SQLInject
    SQLInject --> XSSProtect
    XSSProtect --> CSRFProtect
    
    E2EEncryption --> FieldEncryption
    FieldEncryption --> HSM
    KeyRotation --> HSM
    
    VPC --> SecurityGroups
    SecurityGroups --> NetworkACL
    
    AuditLog --> HIPAA
    HIPAA --> GDPR
    GDPR --> SOC2
    
    CrisisDetect --> RiskAssess
    RiskAssess --> EmergencyProto
    EmergencyProto --> ProfessionalAlert
    
    SIEM --> Intrusion
    Intrusion --> Anomaly
    Anomaly --> IncidentResp
    
    classDef client fill:#e1f5fe
    classDef network fill:#f3e5f5
    classDef auth fill:#e8f5e8
    classDef app fill:#fff3e0
    classDef data fill:#fce4ec
    classDef infra fill:#f1f8e9
    classDef compliance fill:#e0f2f1
    classDef crisis fill:#fff8e1
    classDef monitor fill:#fce4ec
    
    class ClientEnc,Biometric,LocalKey,DeviceAttest client
    class TLS,CertPin,MTLS,WAF network
    class MFA,JWT,OAuth,RiskAuth auth
    class InputValid,SQLInject,XSSProtect,CSRFProtect,RateLimit app
    class E2EEncryption,FieldEncryption,KeyRotation,HSM,DataMasking data
    class VPC,SecurityGroups,NetworkACL,Bastion,VPN infra
    class AuditLog,HIPAA,GDPR,SOC2,PenTest compliance
    class CrisisDetect,RiskAssess,EmergencyProto,ProfessionalAlert crisis
    class SIEM,Intrusion,Anomaly,IncidentResp,ThreatIntel monitor
```

### 3. AI/ML Architecture

```mermaid
graph TB
    subgraph "Data Ingestion"
        TextInput[Text Input]
        VoiceInput[Voice Input]
        BehaviorData[Behavioral Data]
        ContextData[Context Data]
        HistoryData[Historical Data]
    end
    
    subgraph "Preprocessing Pipeline"
        TextPreprocess[Text Preprocessing<br/>NLP Pipeline]
        VoicePreprocess[Voice Feature Extraction<br/>Audio Processing]
        DataClean[Data Cleaning & Normalization]
        FeatureEng[Feature Engineering]
    end
    
    subgraph "AI/ML Models"
        LLMService[Large Language Model<br/>Bailian AI]
        SentimentModel[Sentiment Analysis<br/>BERT-based]
        EmotionModel[Emotion Detection<br/>Multi-label Classification]
        CrisisModel[Crisis Detection<br/>Ensemble Model]
        MoodModel[Mood Analysis<br/>Regression Model]
        PersonalityModel[Personality Modeling<br/>Big Five + Clinical]
        VoiceModel[Voice Analysis<br/>Paralinguistic Features]
    end
    
    subgraph "Analysis Engines"
        MoodEngine[Real-time Mood Analysis]
        CrisisEngine[Crisis Detection Engine]
        PersonalizeEngine[Personalization Engine]
        PatternEngine[Behavioral Pattern Analysis]
        PredictEngine[Predictive Analytics]
    end
    
    subgraph "Decision Systems"
        RiskAssess[Risk Assessment System]
        InterventionDecision[Intervention Decision Tree]
        ResponseGeneration[Response Generation]
        RecommendationEngine[Recommendation Engine]
    end
    
    subgraph "Model Management"
        ModelServing[Model Serving Infrastructure]
        ModelMonitor[Model Performance Monitoring]
        ABTesting[A/B Testing Framework]
        ModelUpdate[Automated Model Updates]
        BiasDetection[Bias Detection & Mitigation]
    end
    
    subgraph "Data Storage & Memory"
        VectorStore[(Vector Database<br/>Pinecone)]
        ModelStore[(Model Registry<br/>MLflow)]
        ConversationMemory[(Conversation Context<br/>Redis)]
        UserProfile[(User Profiles<br/>PostgreSQL)]
        TrainingData[(Training Data<br/>S3)]
    end
    
    subgraph "Privacy & Ethics"
        DataAnonymize[Data Anonymization]
        DifferentialPrivacy[Differential Privacy]
        ModelExplain[Model Explainability]
        EthicsCheck[Ethics & Bias Checking]
        ConsentManage[Consent Management]
    end
    
    %% Data Flow
    TextInput --> TextPreprocess
    VoiceInput --> VoicePreprocess
    BehaviorData --> DataClean
    ContextData --> FeatureEng
    HistoryData --> FeatureEng
    
    TextPreprocess --> LLMService
    TextPreprocess --> SentimentModel
    TextPreprocess --> EmotionModel
    TextPreprocess --> CrisisModel
    VoicePreprocess --> VoiceModel
    DataClean --> MoodModel
    FeatureEng --> PersonalityModel
    
    LLMService --> MoodEngine
    SentimentModel --> MoodEngine
    EmotionModel --> MoodEngine
    CrisisModel --> CrisisEngine
    MoodModel --> MoodEngine
    PersonalityModel --> PersonalizeEngine
    VoiceModel --> PatternEngine
    
    MoodEngine --> RiskAssess
    CrisisEngine --> InterventionDecision
    PersonalizeEngine --> ResponseGeneration
    PatternEngine --> PredictEngine
    
    RiskAssess --> ResponseGeneration
    InterventionDecision --> ResponseGeneration
    ResponseGeneration --> RecommendationEngine
    
    ModelServing -.-> LLMService
    ModelServing -.-> SentimentModel
    ModelMonitor -.-> ModelUpdate
    ABTesting -.-> ModelUpdate
    BiasDetection -.-> EthicsCheck
    
    %% Storage Connections
    MoodEngine --> VectorStore
    PersonalizeEngine --> UserProfile
    PatternEngine --> ConversationMemory
    ModelUpdate --> ModelStore
    DataClean --> TrainingData
    
    %% Privacy Layer
    DataAnonymize -.-> DataClean
    DifferentialPrivacy -.-> ModelServing
    ModelExplain -.-> ResponseGeneration
    EthicsCheck -.-> InterventionDecision
    ConsentManage -.-> DataAnonymize
    
    classDef input fill:#e1f5fe
    classDef preprocess fill:#f3e5f5
    classDef model fill:#e8f5e8
    classDef engine fill:#fff3e0
    classDef decision fill:#fce4ec
    classDef management fill:#f1f8e9
    classDef storage fill:#e0f2f1
    classDef privacy fill:#fff8e1
    
    class TextInput,VoiceInput,BehaviorData,ContextData,HistoryData input
    class TextPreprocess,VoicePreprocess,DataClean,FeatureEng preprocess
    class LLMService,SentimentModel,EmotionModel,CrisisModel,MoodModel,PersonalityModel,VoiceModel model
    class MoodEngine,CrisisEngine,PersonalizeEngine,PatternEngine,PredictEngine engine
    class RiskAssess,InterventionDecision,ResponseGeneration,RecommendationEngine decision
    class ModelServing,ModelMonitor,ABTesting,ModelUpdate,BiasDetection management
    class VectorStore,ModelStore,ConversationMemory,UserProfile,TrainingData storage
    class DataAnonymize,DifferentialPrivacy,ModelExplain,EthicsCheck,ConsentManage privacy
```

### 4. Data Flow Architecture

```mermaid
graph TB
    subgraph "User Interaction Layer"
        UserMessage[User Message Input]
        VoiceInput[Voice Input]
        MoodInput[Mood Check-in]
        SettingsChange[Settings Change]
    end
    
    subgraph "Local Processing (Client)"
        LocalValidation[Input Validation]
        LocalEncryption[Client-side Encryption]
        LocalStorage[SQLite Local Storage]
        OfflineQueue[Offline Operation Queue]
    end
    
    subgraph "API Gateway"
        Authentication[Authentication Check]
        RateLimit[Rate Limiting]
        RequestRouting[Request Routing]
        ResponseAggregation[Response Aggregation]
    end
    
    subgraph "Business Logic Services"
        ConversationSvc[Conversation Service]
        UserSvc[User Service]
        AISvc[AI Processing Service]
        SafetySvc[Safety Monitoring]
        AnalyticsSvc[Analytics Service]
    end
    
    subgraph "AI Processing Pipeline"
        MessageAnalysis[Message Analysis]
        CrisisDetection[Crisis Detection]
        MoodAnalysis[Mood Analysis]
        ResponseGen[Response Generation]
        PersonalizationEngine[Personalization]
    end
    
    subgraph "Data Storage"
        RedisCache[(Redis Cache)]
        PostgreSQL[(PostgreSQL)]
        VectorDB[(Vector Database)]
        FileStorage[(File Storage)]
    end
    
    subgraph "External Integrations"
        BailianAI[Bailian AI Service]
        EmergencyServices[Emergency Services]
        HealthProviders[Healthcare Providers]
        ThirdPartyApps[Wellness Apps]
    end
    
    subgraph "Real-time Processing"
        EventStream[Event Stream]
        NotificationSvc[Notification Service]
        LiveSync[Real-time Sync]
        CrisisAlerts[Crisis Alert System]
    end
    
    subgraph "Data Pipeline"
        ETL[Data Processing Pipeline]
        Analytics[Analytics Processing]
        ML_Training[ML Model Training]
        ReportGeneration[Report Generation]
    end
    
    %% User Interactions
    UserMessage --> LocalValidation
    VoiceInput --> LocalValidation
    MoodInput --> LocalValidation
    SettingsChange --> LocalValidation
    
    %% Local Processing
    LocalValidation --> LocalEncryption
    LocalEncryption --> LocalStorage
    LocalStorage --> OfflineQueue
    OfflineQueue --> Authentication
    
    %% API Gateway Flow
    Authentication --> RateLimit
    RateLimit --> RequestRouting
    RequestRouting --> ConversationSvc
    RequestRouting --> UserSvc
    
    %% Service Processing
    ConversationSvc --> AISvc
    ConversationSvc --> SafetySvc
    UserSvc --> AnalyticsSvc
    
    %% AI Pipeline
    AISvc --> MessageAnalysis
    MessageAnalysis --> CrisisDetection
    MessageAnalysis --> MoodAnalysis
    MoodAnalysis --> ResponseGen
    ResponseGen --> PersonalizationEngine
    
    %% Crisis Flow
    CrisisDetection --> SafetySvc
    SafetySvc --> CrisisAlerts
    CrisisAlerts --> EmergencyServices
    
    %% Data Storage
    ConversationSvc --> RedisCache
    ConversationSvc --> PostgreSQL
    AISvc --> VectorDB
    UserSvc --> PostgreSQL
    PersonalizationEngine --> VectorDB
    
    %% External Services
    AISvc --> BailianAI
    SafetySvc --> EmergencyServices
    AnalyticsSvc --> HealthProviders
    AnalyticsSvc --> ThirdPartyApps
    
    %% Real-time Processing
    ConversationSvc --> EventStream
    EventStream --> NotificationSvc
    EventStream --> LiveSync
    SafetySvc --> CrisisAlerts
    
    %% Response Flow
    PersonalizationEngine --> ResponseAggregation
    ResponseAggregation --> LocalStorage
    NotificationSvc --> LocalStorage
    
    %% Data Pipeline
    PostgreSQL --> ETL
    VectorDB --> ETL
    ETL --> Analytics
    Analytics --> ML_Training
    Analytics --> ReportGeneration
    
    %% Sync Back to Client
    LiveSync --> LocalStorage
    
    classDef user fill:#e1f5fe
    classDef local fill:#f3e5f5
    classDef gateway fill:#e8f5e8
    classDef service fill:#fff3e0
    classDef ai fill:#fce4ec
    classDef storage fill:#f1f8e9
    classDef external fill:#e0f2f1
    classDef realtime fill:#fff8e1
    classDef pipeline fill:#f9fbe7
    
    class UserMessage,VoiceInput,MoodInput,SettingsChange user
    class LocalValidation,LocalEncryption,LocalStorage,OfflineQueue local
    class Authentication,RateLimit,RequestRouting,ResponseAggregation gateway
    class ConversationSvc,UserSvc,AISvc,SafetySvc,AnalyticsSvc service
    class MessageAnalysis,CrisisDetection,MoodAnalysis,ResponseGen,PersonalizationEngine ai
    class RedisCache,PostgreSQL,VectorDB,FileStorage storage
    class BailianAI,EmergencyServices,HealthProviders,ThirdPartyApps external
    class EventStream,NotificationSvc,LiveSync,CrisisAlerts realtime
    class ETL,Analytics,ML_Training,ReportGeneration pipeline
```

### 5. Offline-First Synchronization

```mermaid
sequenceDiagram
    participant Client
    participant LocalDB
    participant SyncQueue
    participant NetworkMonitor
    participant APIGateway
    participant RemoteDB
    participant ConflictResolver
    
    Note over Client,ConflictResolver: User Creates Message Offline
    
    Client->>LocalDB: Store message locally
    LocalDB-->>Client: Local ID assigned
    Client->>SyncQueue: Queue for sync
    SyncQueue-->>Client: Queued (pending)
    
    Note over Client,ConflictResolver: Network Becomes Available
    
    NetworkMonitor->>Client: Network available
    Client->>SyncQueue: Start sync process
    
    loop For each pending item
        SyncQueue->>APIGateway: Sync request
        APIGateway->>RemoteDB: Check for conflicts
        
        alt No Conflicts
            RemoteDB-->>APIGateway: No conflicts found
            APIGateway->>RemoteDB: Store data
            RemoteDB-->>APIGateway: Success + Remote ID
            APIGateway-->>SyncQueue: Sync success
            SyncQueue->>LocalDB: Update with remote ID
            LocalDB-->>SyncQueue: Updated
        
        else Conflict Detected
            RemoteDB-->>APIGateway: Conflict data
            APIGateway-->>ConflictResolver: Resolve conflict
            ConflictResolver->>ConflictResolver: Apply resolution strategy
            ConflictResolver-->>APIGateway: Resolved data
            APIGateway->>RemoteDB: Store resolved data
            RemoteDB-->>APIGateway: Success
            APIGateway-->>SyncQueue: Conflict resolved
            SyncQueue->>LocalDB: Update with resolved data
            LocalDB-->>SyncQueue: Updated
        
        else Sync Failure
            APIGateway-->>SyncQueue: Sync failed
            SyncQueue->>SyncQueue: Increment retry count
            SyncQueue->>SyncQueue: Schedule retry with backoff
        end
    end
    
    SyncQueue-->>Client: Sync complete
    
    Note over Client,ConflictResolver: Real-time Updates
    
    APIGateway->>Client: Real-time update (WebSocket)
    Client->>LocalDB: Store update
    LocalDB-->>Client: Updated
```

### 6. Crisis Detection and Response Flow

```mermaid
graph TB
    subgraph "Input Sources"
        UserMessage[User Message]
        VoiceAnalysis[Voice Pattern Analysis]
        BehaviorPattern[Behavioral Patterns]
        MoodHistory[Historical Mood Data]
    end
    
    subgraph "Detection Layer"
        KeywordScanner[Crisis Keyword Scanner]
        SentimentAnalyzer[Sentiment Analysis]
        EmotionDetector[Emotion Detection]
        PatternAnalyzer[Behavioral Pattern Analysis]
        VoiceAnalyzer[Voice Stress Analysis]
    end
    
    subgraph "Risk Assessment"
        RiskScoring[Risk Scoring Algorithm]
        ContextAnalysis[Contextual Risk Analysis]
        HistoricalWeighting[Historical Risk Weighting]
        ConfidenceCalculation[Confidence Calculation]
    end
    
    subgraph "Decision Engine"
        RiskThreshold{Risk Level Assessment}
        InterventionDecision[Intervention Decision Tree]
        EscalationRules[Escalation Rules Engine]
        ApprovalWorkflow[Human Approval Workflow]
    end
    
    subgraph "Response Actions"
        LowRisk[Low Risk Response<br/>- Supportive message<br/>- Self-help resources]
        MediumRisk[Medium Risk Response<br/>- Enhanced support<br/>- Coping strategies<br/>- Professional resources]
        HighRisk[High Risk Response<br/>- Crisis intervention<br/>- Hotline connection<br/>- Safety planning]
        CriticalRisk[Critical Risk Response<br/>- Emergency services<br/>- Immediate intervention<br/>- Professional alert]
    end
    
    subgraph "Follow-up Systems"
        CrisisLogger[Crisis Event Logger]
        ProfessionalAlert[Professional Alert System]
        EmergencyDispatch[Emergency Services Dispatch]
        FollowUpScheduler[Follow-up Scheduler]
        OutcomeTracking[Outcome Tracking]
    end
    
    subgraph "Feedback Loop"
        EffectivenessAnalysis[Intervention Effectiveness]
        ModelUpdate[Model Updates]
        ThresholdAdjustment[Threshold Adjustment]
        FalsePositiveReduction[False Positive Reduction]
    end
    
    %% Input Processing
    UserMessage --> KeywordScanner
    UserMessage --> SentimentAnalyzer
    VoiceAnalysis --> VoiceAnalyzer
    BehaviorPattern --> PatternAnalyzer
    MoodHistory --> PatternAnalyzer
    
    %% Detection to Assessment
    KeywordScanner --> RiskScoring
    SentimentAnalyzer --> RiskScoring
    EmotionDetector --> RiskScoring
    PatternAnalyzer --> ContextAnalysis
    VoiceAnalyzer --> RiskScoring
    
    %% Risk Assessment
    RiskScoring --> HistoricalWeighting
    ContextAnalysis --> HistoricalWeighting
    HistoricalWeighting --> ConfidenceCalculation
    
    %% Decision Making
    ConfidenceCalculation --> RiskThreshold
    RiskThreshold --> InterventionDecision
    InterventionDecision --> EscalationRules
    
    %% Risk Level Routing
    RiskThreshold -->|Low Risk<br/>Score: 0-3| LowRisk
    RiskThreshold -->|Medium Risk<br/>Score: 4-6| MediumRisk
    RiskThreshold -->|High Risk<br/>Score: 7-8| HighRisk
    RiskThreshold -->|Critical Risk<br/>Score: 9-10| CriticalRisk
    
    %% High/Critical Risk Approval
    HighRisk --> ApprovalWorkflow
    CriticalRisk --> ApprovalWorkflow
    
    %% Response to Follow-up
    LowRisk --> CrisisLogger
    MediumRisk --> CrisisLogger
    HighRisk --> ProfessionalAlert
    CriticalRisk --> EmergencyDispatch
    
    ProfessionalAlert --> FollowUpScheduler
    EmergencyDispatch --> FollowUpScheduler
    FollowUpScheduler --> OutcomeTracking
    
    %% Feedback Loop
    OutcomeTracking --> EffectivenessAnalysis
    EffectivenessAnalysis --> ModelUpdate
    ModelUpdate --> ThresholdAdjustment
    ThresholdAdjustment --> FalsePositiveReduction
    FalsePositiveReduction --> KeywordScanner
    FalsePositiveReduction --> SentimentAnalyzer
    
    classDef input fill:#e1f5fe
    classDef detection fill:#f3e5f5
    classDef assessment fill:#e8f5e8
    classDef decision fill:#fff3e0
    classDef response fill:#fce4ec
    classDef followup fill:#f1f8e9
    classDef feedback fill:#e0f2f1
    
    class UserMessage,VoiceAnalysis,BehaviorPattern,MoodHistory input
    class KeywordScanner,SentimentAnalyzer,EmotionDetector,PatternAnalyzer,VoiceAnalyzer detection
    class RiskScoring,ContextAnalysis,HistoricalWeighting,ConfidenceCalculation assessment
    class RiskThreshold,InterventionDecision,EscalationRules,ApprovalWorkflow decision
    class LowRisk,MediumRisk,HighRisk,CriticalRisk response
    class CrisisLogger,ProfessionalAlert,EmergencyDispatch,FollowUpScheduler,OutcomeTracking followup
    class EffectivenessAnalysis,ModelUpdate,ThresholdAdjustment,FalsePositiveReduction feedback
```

### 7. Integration Architecture

```mermaid
graph TB
    subgraph "Rebloom Core System"
        CoreAPI[Rebloom Core API]
        UserData[(User Data)]
        ConversationData[(Conversations)]
        AnalyticsEngine[Analytics Engine]
        CrisisSystem[Crisis Detection]
    end
    
    subgraph "Emergency Services Integration"
        EmergencyAPI[Emergency Services API]
        CrisisHotlines[Crisis Hotlines]
        LocalEmergency[Local Emergency Services]
        HospitalNetworks[Hospital Networks]
        MentalHealthCrisis[Mental Health Crisis Teams]
    end
    
    subgraph "Healthcare Provider Integration"
        EHRSystems[EHR Systems<br/>Epic, Cerner, AllScripts]
        TelehealthPlatforms[Telehealth Platforms<br/>Teladoc, Amwell]
        TherapistNetworks[Therapist Networks<br/>Psychology Today, BetterHelp]
        InsuranceSystems[Insurance Systems<br/>Claims, Coverage]
        PharmacySystems[Pharmacy Systems<br/>Prescription Management]
    end
    
    subgraph "Wellness Ecosystem"
        FitnessTrackers[Fitness Trackers<br/>Apple Health, Google Fit]
        SleepMonitoring[Sleep Monitoring<br/>Fitbit, Oura Ring]
        MeditationApps[Meditation Apps<br/>Headspace, Calm]
        NutritionTracking[Nutrition Apps<br/>MyFitnessPal]
        JournalApps[Journal Apps<br/>Day One, Journey]
    end
    
    subgraph "AI/ML Services"
        BailianAI[Bailian AI<br/>Primary LLM]
        OpenAI[OpenAI GPT<br/>Fallback LLM]
        GoogleAI[Google AI<br/>Language Processing]
        AWSComprehend[AWS Comprehend<br/>Sentiment Analysis]
        AzureCognitive[Azure Cognitive<br/>Speech Analysis]
    end
    
    subgraph "Communication Services"
        TwilioSMS[Twilio SMS<br/>Crisis Notifications]
        SendGridEmail[SendGrid Email<br/>Professional Communications]
        PushNotifications[Push Notifications<br/>FCM/APNS]
        WebRTC[WebRTC<br/>Crisis Video Calls]
        SlackIntegration[Slack Integration<br/>Professional Alerts]
    end
    
    subgraph "Compliance & Security"
        HIPAAVault[HIPAA Vault<br/>PHI Storage]
        ComplianceAPIs[Compliance APIs<br/>SOC 2, GDPR]
        AuditSystems[Audit Systems<br/>Compliance Logging]
        SecurityScanning[Security Scanning<br/>Vulnerability Assessment]
        EncryptionServices[Encryption Services<br/>Key Management]
    end
    
    subgraph "Analytics & Monitoring"
        DatadogAPM[Datadog APM<br/>Performance Monitoring]
        SentryErrors[Sentry<br/>Error Tracking]
        MixpanelAnalytics[Mixpanel<br/>User Analytics]
        TableauBI[Tableau<br/>Business Intelligence]
        ElasticSearch[ElasticSearch<br/>Log Analytics]
    end
    
    subgraph "Infrastructure Services"
        AWSServices[AWS Services<br/>RDS, S3, EKS]
        CloudflareProxy[Cloudflare<br/>CDN, DDoS Protection]
        DockerRegistry[Docker Registry<br/>Container Images]
        KubernetesOrch[Kubernetes<br/>Orchestration]
        TerraformIaC[Terraform<br/>Infrastructure as Code]
    end
    
    %% Core System Connections
    CoreAPI --> UserData
    CoreAPI --> ConversationData
    CoreAPI --> AnalyticsEngine
    CoreAPI --> CrisisSystem
    
    %% Emergency Services
    CrisisSystem --> EmergencyAPI
    EmergencyAPI --> CrisisHotlines
    EmergencyAPI --> LocalEmergency
    EmergencyAPI --> HospitalNetworks
    EmergencyAPI --> MentalHealthCrisis
    
    %% Healthcare Providers
    CoreAPI --> EHRSystems
    CoreAPI --> TelehealthPlatforms
    CoreAPI --> TherapistNetworks
    CoreAPI --> InsuranceSystems
    CoreAPI --> PharmacySystems
    
    %% Wellness Integrations
    AnalyticsEngine --> FitnessTrackers
    AnalyticsEngine --> SleepMonitoring
    AnalyticsEngine --> MeditationApps
    AnalyticsEngine --> NutritionTracking
    AnalyticsEngine --> JournalApps
    
    %% AI Services
    CoreAPI --> BailianAI
    CoreAPI --> OpenAI
    CoreAPI --> GoogleAI
    CoreAPI --> AWSComprehend
    CoreAPI --> AzureCognitive
    
    %% Communication
    CrisisSystem --> TwilioSMS
    CoreAPI --> SendGridEmail
    CoreAPI --> PushNotifications
    CrisisSystem --> WebRTC
    CrisisSystem --> SlackIntegration
    
    %% Security & Compliance
    UserData --> HIPAAVault
    CoreAPI --> ComplianceAPIs
    CoreAPI --> AuditSystems
    CoreAPI --> SecurityScanning
    CoreAPI --> EncryptionServices
    
    %% Monitoring
    CoreAPI --> DatadogAPM
    CoreAPI --> SentryErrors
    AnalyticsEngine --> MixpanelAnalytics
    AnalyticsEngine --> TableauBI
    CoreAPI --> ElasticSearch
    
    %% Infrastructure
    CoreAPI --> AWSServices
    CoreAPI --> CloudflareProxy
    CoreAPI --> DockerRegistry
    CoreAPI --> KubernetesOrch
    CoreAPI --> TerraformIaC
    
    classDef core fill:#e1f5fe
    classDef emergency fill:#ffebee
    classDef healthcare fill:#f3e5f5
    classDef wellness fill:#e8f5e8
    classDef ai fill:#fff3e0
    classDef communication fill:#fce4ec
    classDef security fill:#f1f8e9
    classDef analytics fill:#e0f2f1
    classDef infrastructure fill:#fff8e1
    
    class CoreAPI,UserData,ConversationData,AnalyticsEngine,CrisisSystem core
    class EmergencyAPI,CrisisHotlines,LocalEmergency,HospitalNetworks,MentalHealthCrisis emergency
    class EHRSystems,TelehealthPlatforms,TherapistNetworks,InsuranceSystems,PharmacySystems healthcare
    class FitnessTrackers,SleepMonitoring,MeditationApps,NutritionTracking,JournalApps wellness
    class BailianAI,OpenAI,GoogleAI,AWSComprehend,AzureCognitive ai
    class TwilioSMS,SendGridEmail,PushNotifications,WebRTC,SlackIntegration communication
    class HIPAAVault,ComplianceAPIs,AuditSystems,SecurityScanning,EncryptionServices security
    class DatadogAPM,SentryErrors,MixpanelAnalytics,TableauBI,ElasticSearch analytics
    class AWSServices,CloudflareProxy,DockerRegistry,KubernetesOrch,TerraformIaC infrastructure
```

### 8. Deployment Pipeline

```mermaid
graph TB
    subgraph "Source Control"
        GitRepo[Git Repository<br/>GitHub]
        FeatureBranch[Feature Branch]
        DevelopBranch[Develop Branch]
        MainBranch[Main Branch]
        ReleaseTag[Release Tag]
    end
    
    subgraph "CI/CD Pipeline"
        GitHubActions[GitHub Actions]
        CodeQuality[Code Quality Checks<br/>ESLint, Prettier, SonarQube]
        SecurityScan[Security Scanning<br/>Snyk, CodeQL]
        UnitTests[Unit Tests<br/>Jest]
        IntegrationTests[Integration Tests<br/>Supertest]
        E2ETests[E2E Tests<br/>Detox]
        BuildStage[Build & Package<br/>Docker Images]
    end
    
    subgraph "Artifact Management"
        ContainerRegistry[Container Registry<br/>AWS ECR]
        HelmCharts[Helm Chart Registry]
        TerraformModules[Terraform Module Registry]
        SecurityScanning[Image Vulnerability Scanning]
    end
    
    subgraph "Environment Promotion"
        DevEnv[Development Environment<br/>Auto-deploy on merge]
        StagingEnv[Staging Environment<br/>Manual approval required]
        ProdEnv[Production Environment<br/>Release approval required]
        CanaryDeployment[Canary Deployment<br/>Gradual rollout]
    end
    
    subgraph "Infrastructure Management"
        TerraformCloud[Terraform Cloud<br/>Infrastructure as Code]
        AWSInfra[AWS Infrastructure<br/>EKS, RDS, S3]
        KubernetesCluster[Kubernetes Cluster<br/>Application deployment]
        HelmDeployment[Helm Deployment<br/>Chart-based deployment]
    end
    
    subgraph "Monitoring & Alerting"
        HealthChecks[Health Checks<br/>Readiness & Liveness]
        PerformanceMonitor[Performance Monitoring<br/>Datadog APM]
        ErrorTracking[Error Tracking<br/>Sentry]
        LogAggregation[Log Aggregation<br/>CloudWatch]
        AlertManager[Alert Manager<br/>PagerDuty]
    end
    
    subgraph "Rollback & Recovery"
        BlueGreenDeploy[Blue-Green Deployment]
        RollbackMechanism[Automated Rollback<br/>On failure detection]
        DatabaseMigrations[Database Migrations<br/>Versioned & Rollback-safe]
        BackupRestore[Backup & Restore<br/>Point-in-time recovery]
    end
    
    %% Source Control Flow
    FeatureBranch --> DevelopBranch
    DevelopBranch --> MainBranch
    MainBranch --> ReleaseTag
    
    %% CI/CD Trigger
    FeatureBranch --> GitHubActions
    DevelopBranch --> GitHubActions
    MainBranch --> GitHubActions
    
    %% Pipeline Stages
    GitHubActions --> CodeQuality
    CodeQuality --> SecurityScan
    SecurityScan --> UnitTests
    UnitTests --> IntegrationTests
    IntegrationTests --> E2ETests
    E2ETests --> BuildStage
    
    %% Artifact Management
    BuildStage --> ContainerRegistry
    BuildStage --> HelmCharts
    GitHubActions --> TerraformModules
    ContainerRegistry --> SecurityScanning
    
    %% Environment Deployment
    ContainerRegistry --> DevEnv
    DevEnv --> StagingEnv
    StagingEnv --> ProdEnv
    ProdEnv --> CanaryDeployment
    
    %% Infrastructure
    TerraformModules --> TerraformCloud
    TerraformCloud --> AWSInfra
    AWSInfra --> KubernetesCluster
    HelmCharts --> HelmDeployment
    HelmDeployment --> KubernetesCluster
    
    %% Monitoring
    DevEnv --> HealthChecks
    StagingEnv --> HealthChecks
    ProdEnv --> HealthChecks
    HealthChecks --> PerformanceMonitor
    PerformanceMonitor --> ErrorTracking
    ErrorTracking --> LogAggregation
    LogAggregation --> AlertManager
    
    %% Recovery
    CanaryDeployment --> BlueGreenDeploy
    AlertManager --> RollbackMechanism
    RollbackMechanism --> BlueGreenDeploy
    KubernetesCluster --> DatabaseMigrations
    DatabaseMigrations --> BackupRestore
    
    classDef source fill:#e1f5fe
    classDef cicd fill:#f3e5f5
    classDef artifacts fill:#e8f5e8
    classDef environments fill:#fff3e0
    classDef infrastructure fill:#fce4ec
    classDef monitoring fill:#f1f8e9
    classDef recovery fill:#e0f2f1
    
    class GitRepo,FeatureBranch,DevelopBranch,MainBranch,ReleaseTag source
    class GitHubActions,CodeQuality,SecurityScan,UnitTests,IntegrationTests,E2ETests,BuildStage cicd
    class ContainerRegistry,HelmCharts,TerraformModules,SecurityScanning artifacts
    class DevEnv,StagingEnv,ProdEnv,CanaryDeployment environments
    class TerraformCloud,AWSInfra,KubernetesCluster,HelmDeployment infrastructure
    class HealthChecks,PerformanceMonitor,ErrorTracking,LogAggregation,AlertManager monitoring
    class BlueGreenDeploy,RollbackMechanism,DatabaseMigrations,BackupRestore recovery
```

## Component Interaction Patterns

### 1. Request-Response Flow
```mermaid
sequenceDiagram
    participant Client
    participant Gateway
    participant Service
    participant Database
    participant AI_Service
    
    Client->>Gateway: API Request
    Gateway->>Gateway: Authentication & Rate Limiting
    Gateway->>Service: Forward Request
    Service->>Database: Query Data
    Database-->>Service: Return Data
    Service->>AI_Service: Process with AI
    AI_Service-->>Service: AI Response
    Service-->>Gateway: Response
    Gateway-->>Client: Final Response
```

### 2. Event-Driven Architecture
```mermaid
sequenceDiagram
    participant Service_A
    participant EventBus
    participant Service_B
    participant Service_C
    participant Database
    
    Service_A->>EventBus: Publish Event
    EventBus->>Service_B: Deliver Event
    EventBus->>Service_C: Deliver Event
    Service_B->>Database: Update State
    Service_C->>Database: Log Event
    Service_B-->>EventBus: Acknowledge
    Service_C-->>EventBus: Acknowledge
```

### 3. Crisis Detection Workflow
```mermaid
sequenceDiagram
    participant User
    participant ChatService
    participant CrisisDetection
    participant SafetyService
    participant EmergencyService
    participant Professional
    
    User->>ChatService: Send Message
    ChatService->>CrisisDetection: Analyze Message
    CrisisDetection-->>ChatService: Risk Assessment
    
    alt High Risk Detected
        ChatService->>SafetyService: Trigger Crisis Protocol
        SafetyService->>EmergencyService: Contact Emergency Services
        SafetyService->>Professional: Alert Professional
        SafetyService-->>User: Immediate Support Resources
    else Low Risk
        ChatService-->>User: Normal AI Response
    end
```

This comprehensive set of architectural diagrams provides visual representations of all major system components, data flows, and interaction patterns for the Rebloom mental health AI application.