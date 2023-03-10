# SCM Feed mirror

Static mirror for NatureScot's SCM feed data

Automation and version control inspired by [Simon Willison's work on git scraping](https://simonwillison.net/2020/Oct/9/git-scraping/).

## Debug with VSCode

```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Launch via npm",
            "type": "node",
            "runtimeVersion": "18",
            "request": "launch",
            "cwd": "${workspaceFolder}",
            "runtimeExecutable": "npm",
            "runtimeArgs": ["run-script", "start"]
          }
    ]
}
```

## Serving locally

- [Download](https://caddyserver.com/download) a copy of the [Caddy web server](https://caddyserver.com/).
- Run the following command

  ```sh
  caddy run --config Caddyfile
  ```

- Visit [http://localhost:8080/scm-feed/sites](http://localhost:8080/scm-feed/sites).

## Deployment

The static files are automatically created and deployed to an AWS S3 bucket on
- Push / merge to the GitHub main branch
- Overnight


## License

Unless otherwise stated, all data is made available under the [Open Government Licence, Version 3](LICENSE.md) and the codebase is released under the [MIT License](LICENSE-MIT.txt).
