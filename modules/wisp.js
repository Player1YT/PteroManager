module.exports = (client) => {

    client.parseNode = async (node) => {

        if (node === undefined) throw "Invalid Node";

        return {
            name: node.name,
            description: node.description,
            ram: {
                max: node.memory,
                used: 0,
                overallocated: node.cpu_overallocate
            },
            disk: {
                max: node.disk,
                used: 0,
                overallocated: node.disk_overallocate
            },
            cpu: {
                threads: 0,
                cores: node.cpu
            },
            daemon: {
                listen: node.daemon_listen,
                sftp: node.daemon_sftp,
                base: node.daemon_base,
                fastdl: node.daemon_fast_d_l,
            },
            migration: {
                id: node.migration_id,
                origid: node.migration_orig_id
            },
            time: {
                updated: node.updated_at,
                created: node.created_at
            },
            fqdn: {
                main: node.fqdn,
                display: node.display_fqdn,
            },
            other: {
                license: node.license_key,
                scheme: node.scheme,
                uploadmax: node.upload_size,
                public: node.public,
                maintenance: node.maintenance_mode
            }
        }

    }

}