import '../style.css'
import {default as renderUI} from './renderUI';
import {default as addEventListeners} from './listeners';
import { initializeDefaultProjects } from './project';

/**
 * commit
 * clean up/comment code
 * clean up/comment css
 * push project
 */

initializeDefaultProjects();
renderUI();
addEventListeners();
