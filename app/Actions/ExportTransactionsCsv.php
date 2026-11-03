<?php

namespace App\Actions;

use App\Models\Transaction;
use Illuminate\Database\Eloquent\Builder;
use RuntimeException;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExportTransactionsCsv
{
    /**
     * @param  Builder<Transaction>  $transactions
     */
    public function execute(Builder $transactions, string $filename): StreamedResponse
    {
        return response()->streamDownload(function () use ($transactions): void {
            $output = fopen('php://output', 'w');

            if ($output === false) {
                throw new RuntimeException('Unable to open the CSV output stream.');
            }

            fwrite($output, "\xEF\xBB\xBF");
            fputcsv($output, ['Data', 'Tipo', 'Categoria', 'Descrição', 'Valor'], ';', '"', '', "\r\n");

            $transactions->chunk(500, function ($transactionChunk) use ($output): void {
                foreach ($transactionChunk as $transaction) {
                    fputcsv($output, [
                        $transaction->date->format('d/m/Y'),
                        $transaction->type === 'income' ? 'Receita' : 'Despesa',
                        $this->safeCsvValue($transaction->category->name),
                        $this->safeCsvValue($transaction->description),
                        str_replace('.', ',', (string) $transaction->amount),
                    ], ';', '"', '', "\r\n");
                }
            });

            fclose($output);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    private function safeCsvValue(string $value): string
    {
        return preg_match('/^[\x00-\x20]*[=+\-@]/u', $value) === 1
            ? "'".$value
            : $value;
    }
}
