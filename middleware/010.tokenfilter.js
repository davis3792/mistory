var allowAnonymousAccess = [
        "/user/login", "/health", "/sp/.*"
];

module.exports = function(app) {
        app.use(function(req, res, next) {
                var allowAnonymous = false;

                for (var i = 0; i < allowAnonymousAccess.length; i++) {
                        if (req.url.match(allowAnonymousAccess[i])) {
                                allowAnonymous = true;
                        }
                }

                if (allowAnonymous) {
                        next();
                } else {
                        app.models.security.hasValidToken(req)
                                .then(function(res) {
                                        if(res === true)  {
                                                next();
                                        } else {
                                                res.status(401).json({
                                                        errorMessage : "Not Authenticated",
                                                        errorCode : 401
                                                });
                                        }
                                })
                                .fail(function(err) {
                                        res.status(401).json({
                                                errorMessage : "Not Authenticated",
                                                errorCode : 401
                                        });
                                });
                }
        });
};

