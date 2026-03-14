import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Goal } from './goal.service';

@Injectable({
    providedIn: 'root'
})
export class SuggestionService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/api/suggestions`;

    private suggestionsSubject = new BehaviorSubject<Goal[]>([]);
    suggestions$ = this.suggestionsSubject.asObservable();

    constructor() { }

    async getSuggestions(): Promise<Goal[]> {
        try {
            const suggestions = await firstValueFrom(this.http.get<Goal[]>(this.apiUrl));
            this.suggestionsSubject.next(suggestions);
            return suggestions;
        } catch (error) {
            console.error('Error fetching suggestions from API', error);
            return [];
        }
    }

    async createSuggestion(data: { title: string; progress?: number; email?: string }): Promise<{ success: boolean, suggestion?: Goal }> {
        try {
            const sk = `SUGGESTION#${crypto.randomUUID()}`; // Using SUGGESTION prefix for suggestion repo if applicable, or keep it consistent
            const pk = `ADMIN#SUGGESTIONS`; // Mock PK if it's a global pool
            const created_at = new Date().toISOString().split('T')[0];

            const payload: any = { ...data, sk, pk, type: 'goal', created_at, progress: data.progress ?? 0 };

            const newSuggestion = await firstValueFrom(this.http.post<Goal>(this.apiUrl, payload));
            const current = this.suggestionsSubject.value;
            this.suggestionsSubject.next([...current, newSuggestion]);
            return { success: true, suggestion: newSuggestion };
        } catch (error) {
            console.error('Error creating suggestion', error);
            return { success: false };
        }
    }

    async updateSuggestion(sk: string, data: Partial<Goal>): Promise<{ success: boolean, suggestion?: Goal }> {
        try {
            // Remove metadata fields from payload
            const { pk, sk: _sk, type, ...updateData } = data as any;

            const encodedSk = encodeURIComponent(sk);
            const updated = await firstValueFrom(this.http.patch<Goal>(`${this.apiUrl}/${encodedSk}`, updateData));
            const current = this.suggestionsSubject.value;
            this.suggestionsSubject.next(current.map(s => (s.sk === sk) ? updated : s));
            return { success: true, suggestion: updated };
        } catch (error) {
            console.error('Error updating suggestion', error);
            return { success: false };
        }
    }

    async deleteSuggestion(sk: string): Promise<{ success: boolean, error?: string }> {
        try {
            const encodedSk = encodeURIComponent(sk);
            await firstValueFrom(this.http.delete(`${this.apiUrl}/${encodedSk}`));
            const updated = this.suggestionsSubject.value.filter(s => s.sk !== sk);
            this.suggestionsSubject.next(updated);
            return { success: true };
        } catch (error) {
            console.error('Error deleting suggestion', error);
            return { success: false, error: 'Failed to delete suggestion' };
        }
    }
}
