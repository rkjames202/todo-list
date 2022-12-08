class List {
    
    constructor(){
        this.list = [];
    }
  
    delete = (id) => {
        this.list.splice(id, 1);
        this.#resetIDs();
    }

    add = (task) => {
        this.list.push(task); 
        this.#resetIDs();
    }

    #resetIDs = () =>{
        this.list.forEach((t, index) => {
            t.id = index;
        });  
    }

    resetList(){
        this.list = [];
    }

}

const toDoList = new List();

export default List;
export { toDoList };

        




