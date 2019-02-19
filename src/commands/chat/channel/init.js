import { Command, flags } from '@oclif/command';
import chalk from 'chalk';
import path from 'path';
import uuid from 'uuid/v4';

import { auth } from '../../../utils/auth';

export class ChannelInit extends Command {
    static flags = {
        id: flags.string({
            char: 'i',
            description: chalk.blue.bold(
                'A unique ID for the channel you wish to create.'
            ),
            default: uuid(),
            required: true,
        }),
        type: flags.string({
            char: 't',
            description: chalk.blue.bold('Type of channel.'),
            options: ['livestream', 'messaging', 'gaming', 'commerce', 'team'],
            required: true,
        }),
        name: flags.string({
            char: 'n',
            description: chalk.blue.bold('Name of the channel room.'),
            required: true,
        }),
        image: flags.string({
            char: 'u',
            description: chalk.blue.bold('URL to channel image.'),
            required: false,
        }),
        members: flags.string({
            char: 'm',
            description: chalk.blue.bold(
                'Comma separated list of members to add to the channel.'
            ),
            required: false,
        }),
        data: flags.string({
            char: 'd',
            description: chalk.blue.bold('Additional data as a JSON.'),
            required: false,
        }),
    };

    async run() {
        const { flags } = this.parse(ChannelInit);

        try {
            const client = await auth(
                path.join(this.config.configDir, 'config.json'),
                this
            );

            let payload = {
                name: flags.name,
                created_by: {
                    id: uuid(),
                    name: 'CLI',
                },
            };
            if (flags.image) payload.image = flags.image;
            if (flags.members) payload.members = flags.members.split(',');

            if (flags.data) {
                const parsed = JSON.parse(flags.data);
                payload = Object.assign({}, payload, parsed);
            }

            const channel = await client.channel(flags.type, flags.id, payload);
            await channel.create();

            this.log(`The channel ${flags.name} has been initialized!`, {
                emoji: 'rocket',
            });
            this.exit(0);
        } catch (err) {
            this.error(err, { exit: 1 });
        }
    }
}

ChannelInit.description = 'Create a new channel.';