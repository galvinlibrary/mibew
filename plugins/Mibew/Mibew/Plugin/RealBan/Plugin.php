<?php
/*
 * This file is a part of Mibew Real Ban Plugin.
 *
 * Copyright 2014 Dmitriy Simushev <simushevds@gmail.com>.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @file The main file of Mibew:RealBan plugin.
 */

namespace Mibew\Mibew\Plugin\RealBan;

use Mibew\Ban;
use Mibew\EventDispatcher\EventDispatcher;
use Mibew\EventDispatcher\Events;
use Mibew\Plugin\AbstractPlugin;
use Mibew\Plugin\PluginInterface;
use Mibew\Settings;
use Mibew\Thread;

/**
 * The main plugin's file definition.
 *
 * It only attaches handlers to some events.
 */
class Plugin extends AbstractPlugin implements PluginInterface
{
    /**
     * The plugin does not need extra initialization thus it is always ready to
     * work.
     *
     * @return boolean
     */
    public function initialized()
    {
        return true;
    }

    /**
     * The main entry point of a plugin.
     */
    public function run()
    {
        if (!Settings::get('enableban')) {
            // Bans are disabled. The plugin should do nothing in this case.
            return;
        }

        $dispatcher = EventDispatcher::getInstance();
        $dispatcher->attachListener(Events::USERS_UPDATE_THREADS_ALTER, $this, 'alterThreads');
        $dispatcher->attachListener(Events::USERS_UPDATE_VISITORS_ALTER, $this, 'alterVisitors');
        $dispatcher->attachListener(Events::THREAD_UPDATE, $this, 'handleThreadUpdate');
    }

    /**
     * Specify dependencies of the plugin.
     *
     * @return array List of dependencies
     */
    public static function getDependencies()
    {
        // This plugin does not depend on others so return an empty array.
        return array();
    }

    /**
     * A handler for
     * {@link \Mibew\EventDispatcher\Events::USERS_UPDATE_THREADS_ALTER} event.
     *
     * @param array $args Event arguments.
     */
    public function alterThreads(&$args)
    {
        $threads = array();
        foreach ($args['threads'] as $thread) {
            if ($thread['ban']) {
                // Skip banned threads
                continue;
            }
            $threads[] = $thread;
        }

        $args['threads'] = $threads;
    }

    /**
     * A handler for
     * {@link \Mibew\EventDispatcher\Events::USERS_UPDATE_VISITORS_ALTER} event.
     *
     * @param array $args Event arguments.
     */
    public function alterVisitors(&$args)
    {
        $visitors = array();
        foreach ($args['visitors'] as $visitor) {
            $ban = Ban::loadByAddress($visitor['userIp']);
            if ($ban && !$ban->isExpired()) {
                // Skip banned visitors
                continue;
            }
            $visitors[] = $visitor;
        }

        $args['visitors'] = $visitors;
    }

    /**
     * A handler for {@link \Mibew\EventDispatcher\Events::THREAD_UPDATE} event.
     *
     * When the thread is added to the awaiting queue the method sends
     * notification about ban if it's needed.
     *
     * @param array $args Event arguments.
     */
    public function handleThreadUpdate($args)
    {
        $thread = $args['thread'];
        $orig_thread = $args['original_thread'];

        if ($thread->state != $orig_thread->state && $thread->state == Thread::STATE_QUEUE) {
            // State is change and the thread is in the awaiting queue now.
            $ban = Ban::loadByAddress($thread->remote);
            if ($ban && !$ban->isExpired()) {
                // Operators could not see the user, because he is banned. A
                // notification should be sent to let user know that he is
                // banned.
                $thread->postMessage(
                    Thread::KIND_INFO,
                    getlocal('Sorry, but your IP address is banned by some reasons. Try to use another way to contact the support.')
                );
            }
        }
    }

    /**
     * Specify version of the plugin.
     *
     * @return string Plugin's version.
     */
    public static function getVersion()
    {
        return '1.1.0';
    }
}
