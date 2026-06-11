# Harness Starter Configuration for ChatALL

This directory contains Harness CI/CD configuration files for the ChatALL Web Access project.

## Prerequisites

Before using these configurations, you need to set up the following in your Harness account:

### 1. Connectors

Create the following connectors in your Harness project:

| Connector Name | Type | Description |
|----------------|------|-------------|
| `github_connector` | GitHub | Connects to your GitHub repository |
| `dockerhub_connector` | Docker Registry | For pulling base images |
| `kubernetes_connector` | Kubernetes Cluster | For deploying to Kubernetes |
| `harness-artifacts` | S3/GCS/Artifactory | For storing build artifacts |

### 2. Secrets

Add these secrets to your Harness environment:

| Secret Name | Type | Description |
|-------------|------|-------------|
| `NPM_TOKEN` | Secret Text | NPM registry authentication token |
| `GH_TOKEN` | Secret Text | GitHub personal access token (repo scope) |
| `SENTRY_DSN` | Secret Text | Sentry DSN for error tracking (optional) |

### 3. Infrastructure

Ensure you have a Kubernetes cluster available with:
- Nginx Ingress Controller installed
- TLS certificate (Let's Encrypt recommended)
- Persistent Volume for static files

## Pipeline Structure

### Stage 1: Build
- **Install Dependencies**: Installs npm packages using `npm ci`
- **Run Lint**: Runs ESLint to ensure code quality
- **Build Production**: Builds the Vue.js application for production
- **Verify Build**: Runs deployment verification script
- **Upload Artifact**: Uploads build artifacts to artifact store

### Stage 2: Deploy to GitHub Pages
- **Deploy to GH Pages**: Deploys built artifacts to GitHub Pages
- **Post Deploy Health Check**: Runs health check script

## Usage

### Importing Configurations

1. **Create Harness Project**: 
   - Go to Harness Platform → Projects → New Project
   - Name: `ChatALL`
   - Description: `ChatALL Web Access CI/CD`

2. **Import Pipeline**:
   - Go to Pipelines → New Pipeline → Import from YAML
   - Upload: `.harness/pipelines/ChatALL_Web_CICD.yaml`

3. **Import Service**:
   - Go to Services → New Service → Import from YAML
   - Upload: `.harness/services/ChatALL_Web_Service.yaml`

4. **Import Environment**:
   - Go to Environments → New Environment → Import from YAML
   - Upload: `.harness/environments/ChatALL_Web_Environments.yaml`

5. **Configure Triggers**:
   - Go to Pipeline → Triggers → Add Trigger
   - Create a GitHub push trigger for `main` branch
   - Set up PR triggers for preview environments

## Configuration Files

| File | Description |
|------|-------------|
| `pipelines/ChatALL_Web_CICD.yaml` | Main CI/CD pipeline configuration |
| `environments/ChatALL_Web_Environments.yaml` | Environment definitions and secrets |
| `services/ChatALL_Web_Service.yaml` | Kubernetes deployment manifests |

## Environment Variables

The following environment variables are used:

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Node.js environment | production |
| `VUE_APP_ENV` | Application environment | production |
| `VUE_APP_API_BASE_URL` | API base URL | https://api.chatall.app |
| `PUBLIC_PATH` | Public path for assets | /ChatALL/ |

## GitHub Pages Deployment

The pipeline automatically deploys to GitHub Pages using the `npm run deploy` script. Ensure:
- Your GitHub token has `repo` scope
- GitHub Pages is enabled in your repository settings
- The `CNAME` file is correctly configured for custom domains

## Health Checks

After deployment, the pipeline runs `scripts/health-check.js` to verify:
- Application is accessible
- All required endpoints are responding
- No critical errors in logs

## Troubleshooting

### Common Issues

1. **Build fails due to missing dependencies**:
   - Ensure `npm ci` is used instead of `npm install`
   - Check that `package-lock.json` is committed

2. **Deployment fails**:
   - Verify GitHub token permissions
   - Check that GitHub Pages is enabled
   - Ensure `publicPath` in `vue.config.js` matches your deployment path

3. **Kubernetes deployment issues**:
   - Verify Ingress controller is properly configured
   - Check TLS certificate status
   - Ensure PersistentVolumeClaim is available

### Logs

All pipeline logs are available in Harness:
- Go to Pipelines → Select Pipeline → Execution History
- Click on any execution to view detailed logs

## Support

For issues related to Harness configuration, refer to:
- [Harness Documentation](https://docs.harness.io/)
- [Harness Community](https://community.harness.io/)

## License

This configuration is part of the ChatALL project. See LICENSE file for details.