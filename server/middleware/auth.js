import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()
const SECRET = process.env.SECRET;

const auth = async (req, res, next) => {
    try {
        if (!req.headers.authorization) {
            return res.status(401).json({ message: "Unauthenticated: Missing Authorization header" });
        }

        const tokenParts = req.headers.authorization.split(" ")
        if (tokenParts.length < 2) {
            return res.status(401).json({ message: "Unauthenticated: Malformed Authorization header" });
        }
        const token = tokenParts[1]
        const isCustomAuth = token.length < 500 

        let decodeData;

        //If token is custom token do this
        if(token && isCustomAuth) {
            decodeData = jwt.verify(token, SECRET)

            req.userId = decodeData?.id

        } else {
            //Else of token is google token then do this
            decodeData = jwt.decode(token)

            req.userId = decodeData?.sub
        }

        next()

    } catch (error) {
        console.log("Auth middleware error:", error.message)
        return res.status(401).json({ message: "Unauthenticated: Invalid or expired token" });
    }
}

export default auth