const indexController = {};

indexController.buildIndex = async function (req, res) {
  res.json({
    message: "Welcome to the Holiday API",
    available_routes: {
      "/holidays": "Retrieve the list of holidays",
      "/api-docs": "View the API documentation"
    }
  });
};

module.exports = indexController;
