use log::*;
use obws::Client;

/// Engage the OBS plugin.
///
/// ! **UNIMPLEMENTED** - WIP already on a separate branch. We welcome suggestions of features.
pub async fn engage_obs() {
    // Connect to the OBS instance through obs-websocket.
    let client = match Client::connect("localhost", 4455, Some("password")).await {
        Ok(c) => c,
        Err(e) => {
            error!("Failed to connect to OBS: {}", e);
            return;
        }
    };

    // Get and print out version information of OBS and obs-websocket.
    match client.general().version().await {
        Ok(version) => info!("{:#?}", version),
        Err(e) => error!("Failed to get OBS version: {}", e),
    }

    // Get a list of available scenes and print them out.
    match client.scenes().list().await {
        Ok(scene_list) => info!("{:#?}", scene_list),
        Err(e) => error!("Failed to get OBS scene list: {}", e),
    }
}
