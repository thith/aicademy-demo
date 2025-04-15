import lessonContentEn from './lessonContent.en.js';
import lessonContentVi from './lessonContent.vi.js';

const isDebugMode = window.location.search.includes('?d');

export function getLessonContent(lang = 'en') {
  const content = lang === 'vi' ? [...lessonContentVi] : [...lessonContentEn];
  
  if (isDebugMode) {
    content.forEach((item) => {
      if (item.type === 'game' && item.gameType === 'drag-drop') {
        item.items.length = 1
        item.categories.length = 1;
        item.correctPairs = {
          'item-1': 'cat-1'
        }
      }
      if (item.type === 'game' && item.gameType === 'catch-origin') {
        item.winningThreshold = 1;
      }
    });
  }
  return content;
}

export function getPresentationSpeed() {
  if (isDebugMode) {
    return { 'Slow': 1, 'Medium': 1, 'Fast': 1 };
  }
  return { 'Slow': 100, 'Medium': 50, 'Fast': 25 };
}
