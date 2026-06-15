const { auth } = require('express-oauth2-jwt-bearer');
const User = require('../models/userModel');

const checkJwt = auth({
    audience: process.env.AUTH0_AUDIENCE,
    issuerBaseURL: process.env.ISSUER_BASE_URL,
    tokenSigningAlg: 'HS256',
    secret: process.env.SECRET
});

// Requiere que el caller esté autenticado Y tenga role 'admin' en la DB.
// Debe correr DESPUÉS de checkJwt en la pipeline.
const requireAdmin = async (req, res, next) => {
    try {
        const auth0Id = req.auth?.payload?.sub;
        if (!auth0Id) return res.status(401).json({ message: 'Unauthenticated' });

        const user = await User.findOne({ auth0Id });
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin role required' });
        }
        req.dbUser = user;
        next();
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { checkJwt, requireAdmin };
