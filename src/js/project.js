export default Project;
export { Inbox, Today, Upcoming, projects };
import List from "./list";

const projects = [];
const Inbox = new Project('Inbox');
const Today = new Project('Today');
const Upcoming = new Project('Upcoming');

function Project(name){

    this.name = name;
    this.tasks = new List();
    
    projects.push(this);
}




