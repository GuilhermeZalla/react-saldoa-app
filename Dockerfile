FROM php:8.4-fpm

RUN apt-get update && apt-get install -y --no-install-recommends \
    git unzip libzip-dev \
 && docker-php-ext-install pdo_mysql zip bcmath \
 && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

RUN useradd -u 1000 -m dev

WORKDIR /var/www/html
