function initializeMethods(){
    
    this.delete = (id) => {
        this.tasks.splice(id, 1);
        this.resetIDs();
    }

    this.add = (task) => {
        this.tasks.push(task); 
        this.resetIDs();
    }

    this.resetIDs = () => {
        this.tasks.forEach((t, index) => {
            t.id = index;
        });  
    }

    this.resetList = () => {
        this.tasks = [];
    }

    return this;
}

export { initializeMethods }

        




