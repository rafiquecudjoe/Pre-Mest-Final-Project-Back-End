module.exports = checkUser = (request, response,next) => {
     
    const { email } = request.body;

    if (email === "Rafique") {

        response.status(200).send("You are a Robot. Clear Off!!!")
        
    } else {
        
        next();
        
    }
    
}


