/**
 * Initializes methods to project objects 
 * after they are fetched from localStorage
 **/
function initializeMethods(){
    
    //Deletes task with given id
    this.delete = (id) => {
        this.tasks.splice(id, 1);
        this.resetIDs();
    }

    //Add task object to project
    this.add = (task) => {
        this.tasks.push(task); 
        this.resetIDs();
    }

    //Sets the id attribute of each task depending on its array index
    this.resetIDs = () => {
        this.tasks.forEach((t, index) => {
            t.id = index;
        });  
    }

    //Sets task list to empty array
    this.resetList = () => {
        this.tasks = [];
    }

    return this;
}

export { initializeMethods }

        




