import { Injectable } from '@nestjs/common';
import { DictionaryService } from '../dictionary/dictionary.service';

@Injectable()
export class EvolutionService {
  constructor(private readonly dictionaryService: DictionaryService) {}

  async getEvolution(word: string) {
    return this.dictionaryService.getWordEvolution(word);
  }

  async getComparison(word: string) {
    return this.dictionaryService.compareWordEditions(word);
  }
}
