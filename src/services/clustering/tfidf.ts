/**
 * TF-IDF (Term Frequency-Inverse Document Frequency) Calculator
 * Used to convert text documents into numerical vectors for clustering
 */

// Common stop words to filter out
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
  'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought',
  'used', 'it', 'its', 'this', 'that', 'these', 'those', 'i', 'you', 'he',
  'she', 'we', 'they', 'what', 'which', 'who', 'whom', 'when', 'where',
  'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most',
  'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same',
  'so', 'than', 'too', 'very', 'just', 'also', 'now', 'here', 'there',
]);

export interface TFIDFVector {
  id: string;
  vector: Map<string, number>;
  magnitude: number;
}

export interface TFIDFResult {
  vectors: TFIDFVector[];
  vocabulary: string[];
  idf: Map<string, number>;
}

/**
 * Tokenize and clean text
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));
}

/**
 * Calculate term frequency for a document
 */
function calculateTF(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  const totalTerms = tokens.length;

  if (totalTerms === 0) return tf;

  for (const token of tokens) {
    tf.set(token, (tf.get(token) || 0) + 1);
  }

  // Normalize by total terms
  for (const [term, count] of tf) {
    tf.set(term, count / totalTerms);
  }

  return tf;
}

/**
 * Calculate inverse document frequency for all terms
 */
function calculateIDF(documents: Map<string, number>[], vocabulary: Set<string>): Map<string, number> {
  const idf = new Map<string, number>();
  const numDocs = documents.length;

  for (const term of vocabulary) {
    let docsWithTerm = 0;
    for (const doc of documents) {
      if (doc.has(term)) {
        docsWithTerm++;
      }
    }
    // Add 1 to avoid division by zero and smooth the IDF
    idf.set(term, Math.log((numDocs + 1) / (docsWithTerm + 1)) + 1);
  }

  return idf;
}

/**
 * Calculate magnitude of a vector
 */
function calculateMagnitude(vector: Map<string, number>): number {
  let sumSquares = 0;
  for (const value of vector.values()) {
    sumSquares += value * value;
  }
  return Math.sqrt(sumSquares);
}

export class TFIDFCalculator {
  private documents: Map<string, string[]> = new Map();
  private tfVectors: Map<string, Map<string, number>> = new Map();
  private idf: Map<string, number> = new Map();
  private vocabulary: Set<string> = new Set();

  /**
   * Add a document to the calculator
   */
  addDocument(id: string, text: string): void {
    const tokens = tokenize(text);
    this.documents.set(id, tokens);

    // Update vocabulary
    for (const token of tokens) {
      this.vocabulary.add(token);
    }

    // Calculate TF for this document
    this.tfVectors.set(id, calculateTF(tokens));
  }

  /**
   * Remove a document from the calculator
   */
  removeDocument(id: string): void {
    this.documents.delete(id);
    this.tfVectors.delete(id);
  }

  /**
   * Clear all documents
   */
  clear(): void {
    this.documents.clear();
    this.tfVectors.clear();
    this.idf.clear();
    this.vocabulary.clear();
  }

  /**
   * Recalculate IDF values (call after adding/removing documents)
   */
  private recalculateIDF(): void {
    // Rebuild vocabulary from all documents
    this.vocabulary.clear();
    for (const tokens of this.documents.values()) {
      for (const token of tokens) {
        this.vocabulary.add(token);
      }
    }

    this.idf = calculateIDF(Array.from(this.tfVectors.values()), this.vocabulary);
  }

  /**
   * Calculate TF-IDF vector for a single document
   */
  calculateVector(id: string): TFIDFVector | null {
    const tf = this.tfVectors.get(id);
    if (!tf) return null;

    const vector = new Map<string, number>();

    for (const [term, tfValue] of tf) {
      const idfValue = this.idf.get(term) || 0;
      vector.set(term, tfValue * idfValue);
    }

    return {
      id,
      vector,
      magnitude: calculateMagnitude(vector),
    };
  }

  /**
   * Calculate TF-IDF vectors for all documents
   */
  calculateAllVectors(): TFIDFResult {
    this.recalculateIDF();

    const vectors: TFIDFVector[] = [];

    for (const id of this.documents.keys()) {
      const vector = this.calculateVector(id);
      if (vector) {
        vectors.push(vector);
      }
    }

    return {
      vectors,
      vocabulary: Array.from(this.vocabulary),
      idf: this.idf,
    };
  }

  /**
   * Get vocabulary size
   */
  getVocabularySize(): number {
    return this.vocabulary.size;
  }

  /**
   * Get document count
   */
  getDocumentCount(): number {
    return this.documents.size;
  }
}
