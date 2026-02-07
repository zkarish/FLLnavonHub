import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService, ProjectPlan } from './services/gemini.service';
import { ProjectPhaseComponent } from './components/project-phase.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, ProjectPhaseComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {
  private geminiService = inject(GeminiService);

  // State signals
  userGoal = signal<string>('');
  isLoading = signal<boolean>(false);
  projectPlan = signal<ProjectPlan | null>(null);
  error = signal<string | null>(null);
  isExpanded = signal<boolean>(false);

  // Computed/Derived helpers (optional, can be done inline but cleaner here)
  
  async generatePlan() {
    if (!this.userGoal().trim()) return;

    this.isLoading.set(true);
    this.error.set(null);
    this.projectPlan.set(null);

    try {
      const plan = await this.geminiService.generatePlan(this.userGoal());
      this.projectPlan.set(plan);
    } catch (err) {
      this.error.set('Failed to generate plan. Please try again later.');
      console.error(err);
    } finally {
      this.isLoading.set(false);
    }
  }

  reset() {
    this.projectPlan.set(null);
    this.userGoal.set('');
    this.error.set(null);
  }

  getDifficultyColor(difficulty: string | undefined): string {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Hard': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Expert': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }
}