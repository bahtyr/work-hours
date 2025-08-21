import { elements } from './elements.js';
import { renderAll } from './render.js';
import {
    onNew,
    onStop,
    onAddDay,
    onEditDay,
    onCancelEditDay,
    onSaveEditDay,
    onDeleteDay,
    toggleSummary
} from './events.js';

// Attach listeners
elements.newBtn.addEventListener('click', onNew);
elements.stopBtn.addEventListener('click', onStop);
elements.summaryBtn.addEventListener('click', toggleSummary);
elements.addDayBtn.addEventListener('click', onAddDay);
elements.editDayBtn.addEventListener('click', onEditDay);
elements.cancelEditDayBtn.addEventListener('click', onCancelEditDay);
elements.saveEditDayBtn.addEventListener('click', onSaveEditDay);
elements.deleteDayBtn.addEventListener('click', onDeleteDay);

// Initial render
renderAll();
