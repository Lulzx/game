import { hexToRgba } from '../core/Materials.js';

/**
 * UI management for game overlays and dialogs
 */
export class UI {
    constructor() {
        this.elements = {
            location: document.getElementById('current-location'),
            mode: document.getElementById('current-mode'),
            prompt: document.getElementById('interaction-prompt'),
            dialog: document.getElementById('friend-dialog'),
            friendAvatar: document.getElementById('friend-avatar'),
            friendName: document.getElementById('friend-name'),
            friendMessage: document.getElementById('friend-message'),
            loadingScreen: document.getElementById('loading-screen')
        };
    }
    
    updateLocation(location) {
        if (this.elements.location) {
            this.elements.location.textContent = location;
        }
    }
    
    updateMode(mode) {
        if (this.elements.mode) {
            const icons = {
                walking: '🚶 Walking',
                driving: '🚗 Driving',
                indoor: '🏠 Indoors'
            };
            this.elements.mode.textContent = icons[mode] || mode;
        }
    }
    
    showInteractionPrompt(text) {
        if (this.elements.prompt) {
            this.elements.prompt.querySelector('span').innerHTML = text;
            this.elements.prompt.classList.add('visible');
        }
    }
    
    hideInteractionPrompt() {
        if (this.elements.prompt) {
            this.elements.prompt.classList.remove('visible');
        }
    }
    
    showFriendDialog(friend) {
        if (!this.elements.dialog) return;
        
        this.elements.friendAvatar.textContent = friend.emoji;
        this.elements.friendAvatar.style.background = 
            `linear-gradient(135deg, ${hexToRgba(friend.color, 0.3)} 0%, ${hexToRgba(friend.color, 0.1)} 100%)`;
        this.elements.friendName.textContent = friend.name;
        this.elements.friendMessage.textContent = friend.message;
        this.elements.dialog.classList.add('visible');
    }
    
    hideFriendDialog() {
        if (this.elements.dialog) {
            this.elements.dialog.classList.remove('visible');
        }
    }
    
    hideLoadingScreen() {
        if (this.elements.loadingScreen) {
            this.elements.loadingScreen.classList.add('hidden');
        }
    }
    
    showLoadingScreen() {
        if (this.elements.loadingScreen) {
            this.elements.loadingScreen.classList.remove('hidden');
        }
    }
}

// Global close dialog function for HTML onclick
window.closeDialog = function() {
    document.getElementById('friend-dialog')?.classList.remove('visible');
};
