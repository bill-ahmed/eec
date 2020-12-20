import { Router } from "express";
import { RouteKeyRoot } from "../constants";
import { RouteOptions } from "../types";

/** 
 * Given a controller class, construct an express router that represents it.
 */
export default function buildController(klass: any) {
    let instance = new klass();
    let router = Router();
    
    let basePath = instance.PATH || ''

    for(const property in instance) {
        let meta = Reflect.getMetadata(`${RouteKeyRoot}.${property}`, instance, property) as RouteOptions

        // If this property is a route
        if(typeof meta !== 'undefined') {
            // 
            // Create new instance for this route to avoid polluting
            // Side-effect is that it allows the user to keep state
            // between requests...may need a fix for this?
            //
            let new_instance = new klass();

            let uriPath = `${basePath}/${property}`;
            let methodCall = new_instance[property];

            let routeType = meta.type;
            let middleware = meta.middleware ?? []

            // console.log({ uriPath, middleware, methodCall })

            /** Scope the method call to the instance, so helper functions/properties can be used */
            router.use(uriPath, ...middleware, (...args) => methodCall.call(instance, ...args))
        }
    }

    return router;
}