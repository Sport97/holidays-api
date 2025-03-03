const indexController = {};

indexController.buildIndex = async function (req, res) {
  res.json({
    message: "Welcome to the Holiday API",
    available_routes: {
      "/account": "Sign-In Manually via REST",
      "/auth": "Sign-In via Google OAuth",
      "/holidays": "Retrieve the list of holidays",
      "/api-docs": "View the API documentation"
    }
  });
};

module.exports = indexController;
