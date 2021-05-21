const passport = require('passport')   //imports Passport
const passportJWT =require('passport-jwt')    //imports PassportJWT
const JWTStrategy = passportJWT.Strategy   //imports Passport JWT Stragegy


const secret = 'wow123'

const cookieExtractor = req => {
    let jwt = null 

    if (req && req.cookies) {
        jwt = req.cookies['jwt']
    }

    return jwt
}


passport.use('jwt', new JWTStrategy({
    jwtFromRequest: cookieExtractor,
    secretOrKey: secret
}, (jwtPayload, done) => {
    const { expiration } = jwtPayload

    if (Date.now() > expiration) {
        done('Unauthorized', false)
    }

    done(null, jwtPayload)
}))