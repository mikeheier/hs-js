# How to create an npm package (in Gitlab at the project level)
[Gitlab - npm packages in the package registry](https://docs.gitlab.com/ee/user/packages/npm_registry/#npm-packages-in-the-package-registry)

### 1 - Create a project in Gitlab
### 2 - Clone new project
### 3 - Create an npmrc file
Create a file named `.npmrc` (for project level)
The following details are required.
* project id
    * this can be found on the project page under the name
* the gitlab instance host url
    * https://moddevgit.mod-llc.com/
* the package name
    * for project level implementations, this is the parent group name
* an auth token
    * this can be a deploy or access token

Add the sample below to the `.npmrc` and update with the information collected above.
```
@<package_name>:registry=https://gitlab.example.com/api/v4/projects/<project_id>/packages/npm/
//gitlab.example.com/api/v4/projects/<your_project_id>/packages/npm/:_authToken=<auth_token>
```

### 4 - Update the package.json
Update the `name` attribute with the project name scope
```json
{
    "name": "@<package_name>/<proeject_name>"
}
```

Add the `publishConfig` option
```json
{
    "publishConfig": {
        "@<package_name>:registry":"https://gitlab.example.com/api/v4/projects/<project_id>/packages/npm/"
    }
}
```

### 5 - Publish
Run the publish command
```cmd
npm publish
```

# How to consume package
### 1 - Update `.npmrc`
Add the registry alias and auth token to the project level `.npmrc`,  If the global `.npmrc` was updated when creating the npm package, then this step can be skipped.
```cmd
@<package_name>:registry=https://gitlab.example.com/api/v4/projects/<project_id>/packages/npm/
//gitlab.example.com/api/v4/projects/<your_project_id>/packages/npm/:_authToken=<auth_token>
```

### Install the package
```cmd
npm install @<package_name>/<project_name>
```
