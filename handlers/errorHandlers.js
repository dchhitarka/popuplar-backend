/* 
  All the Error which can occur while using the api
  serverError includes all database (mongodb) error as well as errors causing the server to stop working
*/
const errors = (err, type) => {
  switch(type){ 
    case 'serverError':
      return {
        status: "error",
        error: err.message,
        type: err.name
      }
    case 'incompleteFields': 
      return {
        status: "error",
        type: "IncompleteFieldsError",
        error: "Please provide all the necessary data required",
      }
    case 'userIdNotFound': 
      return {
        status: "error",
        error: "User id cannot be null or empty",
        type: "UserIdNotFoundError"
      }
    case 'dataNotFound': 
      return {
        status: "error",
        error: "Data not found",
        type: "DataNotFoundError"
    }
    case 'actionNotAllowed':
      return {
        status: "error",
        type: "ActionNotAllowed",
        error: "You cannot perform this action as it is already done"
    }
  }
}
exports.errors = errors;

/*
  Catch Errors Handler

  With async/await, you need some way to catch errors
  Instead of using try{} catch(e) {} in each controller, we wrap the function in
  catchErrors(), catch any errors they throw, and pass it along to our express middleware with next()
*/

exports.catchErrors = (fn) => {
  return function(req, res, next) {
    return fn(req, res, next).catch(err => {
      res.status(500).json(errors(err, 'serverError'))
    });
  };
};

/*
  Not Found Error Handler

  If we hit a route that is not found, we mark it as 404 and pass it along to the next error handler to display
*/
exports.notFound = (req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  err.title = "404 Not Found";
  next(err);
};

/*
  Development Error Handler

  In development we show good error messages so if we hit a syntax error or any other previously un-handled error, we can show good info on what happened
*/
exports.developmentErrors = (err, req, res, next) => {
  err.stack = err.stack || '';
  const errorDetails = {
    message: err.message,
    status: err.status,
    stackHighlighted: err.stack.replace(/[a-z_-\d]+.js:\d+:\d+/gi, '<mark>$&</mark>')
  };
  res.status(err.status || 500);
  res.format({
    // Based on the `Accept` http header
    'text/html': () => {
      res.render('error', errorDetails);
    }, // Form Submit, Reload the page
    'application/json': () => res.json(errorDetails) // Ajax call, send JSON back
  });
};


/*
  Production Error Handler

  No stacktraces are leaked to user
*/
exports.productionErrors = (err, req, res, next) => {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
};
