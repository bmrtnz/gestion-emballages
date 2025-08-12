# CORS Security Configuration

## Overview

This document describes the secure CORS (Cross-Origin Resource Sharing) configuration implemented in the Blue Whale Portal backend API. The configuration provides environment-specific security controls to prevent unauthorized cross-origin requests while maintaining compatibility with the Angular frontend.

## Security Improvements Made

### Previous Issues
- Single origin configuration with potential for wildcards
- Missing comprehensive header and method controls  
- No environment-specific validation
- Insufficient logging and monitoring
- No validation of production configurations

### Current Secure Implementation

#### 1. Multi-Origin Support
- Supports comma-separated list of allowed origins
- Environment variable: `CORS_ORIGINS`
- Example: `CORS_ORIGINS=https://app.domain.com,https://admin.domain.com`

#### 2. Environment-Specific Security

**Development Environment:**
- Allows localhost origins
- Permits requests with no origin (Postman, mobile apps)
- Shorter cache duration (1 hour)
- Detailed logging of allowed origins

**Production Environment:**
- Requires HTTPS origins only
- Rejects localhost/127.0.0.1 origins
- Blocks wildcard (*) origins
- Longer cache duration (24 hours)
- Secure logging (doesn't expose sensitive origins)

#### 3. Comprehensive Header Control

**Allowed Headers:**
- Standard headers: Origin, Content-Type, Accept
- Authentication: Authorization, X-Api-Key
- Caching: Cache-Control, If-Modified-Since, If-None-Match
- Custom: X-Requested-With, X-Forwarded-For

**Exposed Headers:**
- Pagination: X-Total-Count, X-Page-Count, X-Current-Page
- Caching: ETag, Last-Modified
- Navigation: Link

#### 4. Method Restrictions
- Allowed: GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD
- Blocked: TRACE, CONNECT (security risk)

## Configuration

### Environment Variables

```bash
# Development
CORS_ORIGINS=http://localhost:4200

# Staging  
CORS_ORIGINS=https://staging.domain.com,http://localhost:4200

# Production
CORS_ORIGINS=https://portal.domain.com,https://app.domain.com
```

### File Structure

```
src/
├── config/
│   ├── cors.config.ts      # CORS configuration factory
│   ├── cors.config.spec.ts # Unit tests
│   └── app.config.ts       # Updated app configuration
├── main.ts                 # Updated bootstrap with CORS
└── .env.example           # Environment template
```

## Security Features

### 1. Origin Validation
```typescript
// Validates each origin against security rules
origin: (origin, callback) => {
  if (allowedOrigins.includes(origin)) {
    callback(null, true);
  } else {
    logger.warn(`Blocked CORS request from origin: ${origin}`);
    callback(new Error('Not allowed by CORS'), false);
  }
}
```

### 2. Production Checks
- HTTPS requirement validation
- Localhost rejection  
- Wildcard prevention
- Configuration validation at startup

### 3. Security Logging
- Development: Full origin logging
- Production: Count-based logging (no sensitive data)
- Warning logs for blocked requests
- Error logs for invalid configurations

## Testing

### Unit Tests Coverage
- Origin validation (allowed/blocked)
- Environment-specific behavior
- Production security checks
- Configuration validation
- Header and method verification

### Manual Testing Checklist

#### Development Environment
- [ ] Angular frontend can connect (http://localhost:4200)
- [ ] Postman requests work (no origin)
- [ ] Different ports work if configured
- [ ] Invalid origins are blocked

#### Production Environment
- [ ] Only HTTPS origins work
- [ ] Localhost origins are blocked
- [ ] Wildcard origins are rejected
- [ ] Invalid configurations throw errors
- [ ] CORS headers are present in responses

## Deployment Checklist

### Before Production Deployment

1. **Environment Configuration**
   - [ ] Set `NODE_ENV=production`
   - [ ] Configure `CORS_ORIGINS` with production HTTPS domains
   - [ ] Remove any localhost/development origins
   - [ ] Test configuration validation

2. **Security Validation**
   - [ ] Confirm no wildcard origins
   - [ ] Verify HTTPS requirement
   - [ ] Check allowed headers list
   - [ ] Validate exposed headers

3. **Testing**
   - [ ] Run unit tests: `npm test cors.config.spec.ts`
   - [ ] Test from actual frontend domain
   - [ ] Verify blocked origins return CORS errors
   - [ ] Check browser DevTools for CORS headers

## Monitoring

### What to Monitor
- CORS blocked request warnings
- Configuration validation errors
- Origin validation failures
- Unusual patterns in blocked requests

### Log Examples

```bash
# Development - Allowed
[CORS] CORS enabled for origins: http://localhost:4200, http://localhost:3000

# Production - Secure
[CORS] CORS enabled for 2 configured origin(s)

# Blocked Request
[CORS] Blocked CORS request from origin: https://malicious-site.com
```

## Troubleshooting

### Common Issues

1. **Frontend Can't Connect**
   - Check `CORS_ORIGINS` includes frontend domain
   - Verify protocol matches (http/https)
   - Confirm no typos in domain names

2. **Production Deployment Fails**
   - Ensure all origins use HTTPS
   - Remove localhost origins
   - Check for wildcard (*) origins

3. **Preflight Requests Fail**
   - Verify OPTIONS method is allowed
   - Check custom headers are in `allowedHeaders`
   - Confirm `maxAge` is set appropriately

### Debug Commands

```bash
# Check current environment variables
echo $NODE_ENV
echo $CORS_ORIGINS

# Test CORS from command line
curl -X OPTIONS \
  -H "Origin: https://your-frontend.com" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Authorization" \
  https://your-api.com/api/v1/health
```

## Additional Security Recommendations

1. **Content Security Policy (CSP)**
   - Implement CSP headers for additional security
   - Consider `frame-ancestors` directive

2. **HTTPS Enforcement**
   - Use HSTS headers
   - Redirect HTTP to HTTPS

3. **Rate Limiting**
   - Implement per-origin rate limiting
   - Monitor for unusual CORS preflight patterns

4. **Regular Audits**
   - Review CORS configuration quarterly
   - Monitor for new frontend domains
   - Update security policies as needed

## References

- [MDN CORS Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [NestJS CORS Configuration](https://docs.nestjs.com/security/cors)
- [OWASP CORS Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Origin_Resource_Sharing_Cheat_Sheet.html)