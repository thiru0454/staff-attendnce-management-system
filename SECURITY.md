# Security Policy

## Reporting Security Vulnerabilities

If you discover a security vulnerability in this project, please email security@shesoft.com instead of using the issue tracker.

Please include:
- Description of vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if available)

We will acknowledge receipt of your report and work on a fix promptly.

## Security Best Practices

### For Contributors
1. Never commit sensitive data (API keys, passwords)
2. Use environment variables for configuration
3. Validate all user inputs
4. Keep dependencies updated
5. Follow secure coding practices

### For Users
1. Keep your Supabase credentials secure
2. Use strong, unique passwords
3. Enable 2FA on Supabase account
4. Don't share environment variables
5. Keep the application updated

## Dependency Security

We regularly update dependencies to patch security vulnerabilities:

```bash
# Check for vulnerabilities
bun audit

# Update dependencies
bun update
```

## Data Protection

- All data is encrypted in transit (HTTPS)
- Passwords are hashed by Supabase
- Row-level security (RLS) restricts data access
- No sensitive data stored in browser cache
- Session tokens auto-refresh regularly

## Compliance

This application handles employee data. Ensure compliance with:
- Local data protection regulations
- Privacy laws (GDPR, CCPA, etc.)
- Internal security policies
- Employment data retention requirements

---

**Last Updated**: May 11, 2026
