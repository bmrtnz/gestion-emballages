# Claude Code Sub-Agents for Gestion Emballages v2

This directory contains 22 specialized Claude Code sub-agents designed to handle the complete development lifecycle of the Blue Whale Portal (Gestion Emballages v2) - a comprehensive B2B supply chain management platform for agricultural packaging.

## Agent Overview

### Coordination Agents
- **[01-multi-agent-coordinator](01-multi-agent-coordinator.md)**: Orchestrates complex multi-step tasks across multiple specialized agents
- **[02-context-manager](02-context-manager.md)**: Maintains project knowledge and translates business requirements

### Architecture & Development
- **[03-architecture-analyst](03-architecture-analyst.md)**: System design and technical architecture decisions
- **[04-backend-specialist](04-backend-specialist.md)**: NestJS backend development and business logic
- **[05-frontend-developer](05-frontend-developer.md)**: Angular 18 frontend development and UI implementation
- **[06-database-expert](06-database-expert.md)**: PostgreSQL optimization and schema design
- **[07-testing-engineer](07-testing-engineer.md)**: Comprehensive testing strategies and quality assurance

### Infrastructure & Operations
- **[08-devops-engineer](08-devops-engineer.md)**: Containerization, deployment, and infrastructure management
- **[09-security-auditor](09-security-auditor.md)**: Security assessment and GDPR compliance
- **[10-api-designer](10-api-designer.md)**: RESTful API design and documentation
- **[11-performance-optimizer](11-performance-optimizer.md)**: Performance optimization across all layers
- **[18-monitoring-specialist](18-monitoring-specialist.md)**: System monitoring and observability

### Quality & Maintenance
- **[15-code-reviewer](15-code-reviewer.md)**: Code quality assessment and standards compliance
- **[16-refactoring-specialist](16-refactoring-specialist.md)**: Code improvement and technical debt reduction
- **[17-migration-specialist](17-migration-specialist.md)**: Data migrations and system upgrades
- **[19-dependency-manager](19-dependency-manager.md)**: Package management and security updates

### Specialized Domains
- **[12-documentation-writer](12-documentation-writer.md)**: Technical documentation and knowledge management
- **[13-business-logic-analyst](13-business-logic-analyst.md)**: Domain modeling and business rule implementation
- **[14-ui-ux-designer](14-ui-ux-designer.md)**: User experience design and design system management
- **[20-i18n-specialist](20-i18n-specialist.md)**: Internationalization and localization (French/English)
- **[21-error-handling-specialist](21-error-handling-specialist.md)**: Error handling and system resilience
- **[22-compliance-auditor](22-compliance-auditor.md)**: Regulatory compliance and audit preparation

## Project Context

**System**: Blue Whale Portal - B2B Supply Chain Management Platform  
**Architecture**: NestJS + Angular 18 + PostgreSQL + MinIO + Docker  
**Domain**: Agricultural packaging procurement and supply chain management  
**Users**: Agricultural cooperatives, packaging suppliers, Blue Whale operations  

### Key Business Features
- Multi-supplier product catalog with master contract pricing
- Shopping cart with automatic supplier grouping
- Order management hierarchy (Master Order → Purchase Orders)
- Multi-location inventory tracking and transfers
- Document management with role-based access control
- Business intelligence and performance analytics

## Usage Guidelines

### 1. Task Coordination
Always start complex tasks with the **Multi-Agent Coordinator** to ensure proper task breakdown and agent orchestration.

### 2. Context Validation
Use the **Context Manager** for business requirement validation and domain expertise before implementing features.

### 3. Quality Gates
- **Code Reviewer**: All code changes must pass quality review
- **Security Auditor**: Security review for authentication, data protection, and compliance
- **Testing Engineer**: Comprehensive test coverage for all implementations
- **Performance Optimizer**: Performance impact assessment for system changes

### 4. Specialized Domains
- **Business Logic Analyst**: Complex business rule implementation
- **UI/UX Designer**: User experience design and accessibility compliance
- **API Designer**: Consistent REST API design and documentation

## Agent Interaction Patterns

### Feature Development Flow
1. **Multi-Agent Coordinator** → Task analysis and breakdown
2. **Context Manager** → Business requirement validation
3. **Architecture Analyst** → Technical design decisions
4. **Specialist Agents** → Parallel implementation (Backend, Frontend, Database)
5. **Testing Engineer** → Quality validation
6. **Code Reviewer** → Final quality gate
7. **Documentation Writer** → Documentation update

### Performance Optimization Flow
1. **Performance Optimizer** → Bottleneck identification
2. **Database Expert** → Query optimization
3. **Backend Specialist** → API optimization
4. **Frontend Developer** → UI performance improvements
5. **Monitoring Specialist** → Performance tracking setup

### Security & Compliance Flow
1. **Security Auditor** → Vulnerability assessment
2. **Compliance Auditor** → Regulatory compliance validation
3. **Architecture Analyst** → Security architecture review
4. **Backend Specialist** → Security implementation
5. **Testing Engineer** → Security testing

## Best Practices

### 1. Multi-Agent Coordination
- Use the coordinator for tasks requiring 3+ agents
- Clearly define dependencies and execution order
- Ensure proper handoffs between agents

### 2. Context Awareness
- Always reference project context and business requirements
- Validate technical decisions against business objectives
- Consider impact on all user personas

### 3. Quality Assurance
- Maintain comprehensive test coverage
- Follow established coding standards and patterns
- Ensure accessibility compliance (WCAG 2.1 AA)
- Implement proper error handling and logging

### 4. Performance & Security
- Target <500ms API response times
- Implement defense-in-depth security
- Ensure GDPR compliance for all data processing
- Optimize for 10,000+ concurrent users

## Agent Configuration

Each agent file contains:
- **Agent Overview**: Purpose and specialization
- **Core Competencies**: Key skills and responsibilities
- **Initialization Prompt**: Complete agent setup with project context
- **Success Metrics**: Measurable outcomes and quality standards
- **Integration Points**: Collaboration patterns with other agents

## Success Metrics

### System Performance
- **API Response**: <500ms for 95% of requests
- **Page Load**: <2 seconds for 95% of page loads
- **Database Queries**: <100ms for 95% of queries
- **System Uptime**: 99.9% availability

### Code Quality
- **Test Coverage**: >80% across all modules
- **Security**: Zero critical vulnerabilities
- **Compliance**: 100% GDPR compliance
- **Documentation**: 100% API endpoint documentation

### Business Objectives
- **User Satisfaction**: >90% positive feedback
- **Task Completion**: >95% successful completion rate
- **Cost Reduction**: 15-25% procurement cost reduction
- **Platform Growth**: 500 stations, 200 suppliers by Year 2

## Getting Started

1. Review the comprehensive project documentation in `CLAUDE.md`
2. Start with the **Multi-Agent Coordinator** for complex tasks
3. Use the **Context Manager** to understand business requirements
4. Select appropriate specialist agents based on task requirements
5. Follow established quality gates and review processes

## Support

For questions about agent usage or project context:
- Reference the comprehensive `CLAUDE.md` documentation
- Use the **Context Manager** for business domain questions
- Use the **Documentation Writer** for documentation needs
- Use the **Multi-Agent Coordinator** for complex task planning

---

*These agents provide comprehensive coverage for enterprise-grade B2B platform development while maintaining high standards for security, performance, and user experience.*