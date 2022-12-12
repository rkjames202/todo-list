export default task;

function task(title = 'Untitled Task',
             description,
             dueDate,
             priority,
             project){

    return {title, description, dueDate, priority, project}
}


