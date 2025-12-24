# Deployment Verification Checklist

If you're getting "Module not found" errors during build on the server, verify the following:

## 1. Verify lib directory exists on server
```bash
ls -la /var/www/fast-next/frontend/lib/
```

You should see these files:
- job.ts
- application.ts
- auth.ts
- toast.ts
- axios.ts
- location.ts
- (and other lib files)

## 2. Clear Next.js cache
```bash
cd /var/www/fast-next/frontend
rm -rf .next
rm -rf node_modules/.cache
```

## 3. Reinstall dependencies
```bash
cd /var/www/fast-next/frontend
npm install
```

## 4. Verify tsconfig.json path alias
The `tsconfig.json` should have:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

## 5. Check file permissions
```bash
chmod -R 755 /var/www/fast-next/frontend/lib
```

## 6. Rebuild
```bash
cd /var/www/fast-next/frontend
npm run build
```

## Common Issues:

1. **Files not deployed**: Make sure all files in the `lib/` directory are copied to the server
2. **Case sensitivity**: Linux is case-sensitive, ensure all file names are lowercase
3. **Working directory**: Make sure you're in the correct directory when running `npm run build`
4. **Node version**: Ensure Node.js version matches (check with `node -v`)

