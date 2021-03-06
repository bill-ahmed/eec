# eec (express-es6-classes) <br/>![Test Suite](https://github.com/bill-ahmed/eec/workflows/Test%20Suite/badge.svg?branch=main)

Define ExpressJS routes as Typescript classes using decorators. Inspired by the MVC pattern.

## Install:
```
npm install eec --save
```

This package makes use of decorators and reflect-metadata. so you will also need to enable the following flags in your `tsconfig.json`:
* `"experimentalDecorators": true`
* `"emitDecoratorMetadata": true`

## Usage:

Here's a basic example to get started. Note that `buildController(...)` returns a valid Express Router instance that can be used directly with `app.use(...)`.

```typescript
import express from 'express';
import { route, get, post, buildController, BaseController } from 'eec';

class DashboardController extends BaseController {
    static PATH = '/dashboard'

    @route({ index: true })     // Responds to: /dashboard. `index` says to use as index route
    async index() {
        this.response.status(200).send(`Welcome to the dashboard!`);
    }

    @get()        // Responds to /dashboard/users
    async users() {
        // Also req.params & req.query
        if(this.params.someParameter || this.query.anotherParameter) {
            this.response.json({ name: 'John' });
            return;
        }

        this.response.sendStatus(404)
    }

    @post(':id')    // Responds to /dashboard/updateUser/<user_id>
    async updateUser() {
        if(this.params.id === 'admin') {
            this.response.sendStatus(403);
        } 
        else {
            this.response.status(200).send('Success!');
        }
    }
}

const app = express();
app.use(buildController(DashboardController))

// Go to http://localhost:3000/dashboard/
app.listen(3000, () => { console.log("App listening!") })
```


The `@route()` decorator supports many more configurations. Take a look at the `src/examples` directory to get started with more scenarios.

## Running Examples
To run all the examples provided:
1. Clone this repo
2. `npm install`
3. `npm start`

A server will be listening at port 3000!

## Running tests
```
npm install
npm test
```

## More Example Usages

### Use helper methods defined in the class
```typescript

class DashboardController {
    static PATH = '/dashboard'

    // Responds to: /dashboard/users. The function name is taken to be the endpoint!
    @route()
    async users(req, res) {
        await this.doSomeStuff();

        res.json({ name: 'John', age: 34 })
    }

    // All method NOT marked as @route() are ignored, but are still avilable in each route.
    async doSomeStuff() { console.log('Working!') }
}
```

### Define HTTP method types explicitly:
```typescript

// Don't want a GET route? Specify a different one!
@route({ type: 'post' })
async updateUsers(req, res) { ... }

// Or use one of the several aliases
@post()
async updateUsers(req, res) { ... }

// Respond to multiple HTTP methods
@route({ type: ['post', 'put', 'delete'] })
async updateRecords(req, res) { ... }
```

### Multiple middleware per route:
```typescript
@route({ middleware: [Logger, Authentication] })
async updateData(req, res) { ... }
```

### Define middleware for all routes:
```typescript
@useMiddleware(Logger)          //Pass in array for multiple
class DashboardController {
    static PATH = '/dashboard'

    // This middleware will run AFTER the Logger!
    @route({ middleware: Authentication })
    async users(req, res) { ... }
}

export default buildController(DashboardController)
```

### Request/Response and other objects are also provided inside `this` context!
```typescript
class DashboardController {
    static PATH = '/dashboard'

    @get()
    async users() {
        let raw = this.query.myNum
        let num = Number.parseInt(raw)

        this.response.json({ result: num })

        /** There are aliases provided for:
         * 
         * req --> this.request
         * res --> this.response
         * next --> this.next,
         * 
         * res.locals --> this.locals
         * req.params --> this.params
         * req.query --> this.query
         * 
         * These can be used in any number of 
         * helper functions within the class!
        */
    }
}

export default buildController(DashboardController)
```