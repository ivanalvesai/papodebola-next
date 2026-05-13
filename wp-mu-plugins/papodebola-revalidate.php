<?php
/**
 * Plugin Name: Papo de Bola - Revalidate Next.js
 * Description: Aciona /api/revalidate do Next.js sempre que um post é salvo, agendado, despublicado, lixado ou apagado, para que mudanças apareçam imediatamente no front.
 * Version: 1.0.0
 * Author: Papo de Bola
 */

if (!defined('ABSPATH')) {
    exit;
}

const PDB_REVALIDATE_URL = 'https://www.papodebola.com.br/api/revalidate';

function pdb_get_revalidate_secret() {
    if (defined('PDB_REVALIDATE_SECRET') && PDB_REVALIDATE_SECRET) {
        return PDB_REVALIDATE_SECRET;
    }
    $env = getenv('PDB_REVALIDATE_SECRET');
    return $env ?: '';
}

function pdb_trigger_revalidate($post_id) {
    if (wp_is_post_revision($post_id) || wp_is_post_autosave($post_id)) {
        return;
    }

    $post = get_post($post_id);
    if (!$post || $post->post_type !== 'post') {
        return;
    }

    $secret = pdb_get_revalidate_secret();
    if (!$secret) {
        return;
    }

    $paths = ['/', '/noticias'];
    if (!empty($post->post_name)) {
        $paths[] = '/artigos/' . $post->post_name;
    }

    wp_remote_post(PDB_REVALIDATE_URL, [
        'method'   => 'POST',
        'timeout'  => 5,
        'blocking' => false,
        'headers'  => ['Content-Type' => 'application/json'],
        'body'     => wp_json_encode([
            'secret' => $secret,
            'paths'  => array_values(array_unique($paths)),
        ]),
    ]);
}

add_action('save_post',          'pdb_trigger_revalidate', 10, 1);
add_action('wp_trash_post',      'pdb_trigger_revalidate', 10, 1);
add_action('untrash_post',       'pdb_trigger_revalidate', 10, 1);
add_action('before_delete_post', 'pdb_trigger_revalidate', 10, 1);
add_action('transition_post_status', function ($new, $old, $post) {
    if ($new !== $old) {
        pdb_trigger_revalidate($post->ID);
    }
}, 10, 3);
