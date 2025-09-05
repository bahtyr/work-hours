import {elements} from './elements';
import {renderAll} from './render';
import {onDocumentKeyDown} from './events';
import {toggleSummary} from './events_days';

// Attach listeners
// Main Buttons
elements.toggleSummaryBtn.addEventListener('click', toggleSummary);
// Keys
document.addEventListener('keydown', onDocumentKeyDown);


// Initial render
renderAll();
