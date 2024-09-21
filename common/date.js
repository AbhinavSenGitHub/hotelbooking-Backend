const dateFormate = (date) => {  
    const jsDate = new Date(date);  
    const day = String(jsDate.getDate()).padStart(2, '0'); // Day should be padded  
    const month = String(jsDate.getMonth() + 1).padStart(2, '0'); // Add 1 to month  
    const year = jsDate.getFullYear();  

    const formattedDate = `${day}-${month}-${year}`; // Format as dd-mm-yyyy  

    return formattedDate; // Return formatted date  
}  

module.exports = dateFormate; // Export the function itself