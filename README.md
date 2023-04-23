# Overview

This is a web app designed to allow anyone in the local network to review s/n as part of the AAD tenant, and check IP/MACs against local DHCP servers

# Testing - 

The easiest way to test is to install docker locally on your computer, and then to run the 'local-build.sh' (to compile the react js and then copy all the relevant files to a build folder) and then to 'docker compose up -d' so that you can browse the current version you are editing on port 10090 on your local computer to see how it works. Likely the API will not be able to reach its destination due to the way that the requests work locally, so you might not be able to test the API locally (look into fixing this...)

If you would like to just do full blown testing, commit your changes to the dev branch of the git repo and push them. This will trigger a ci/cd pipeline with drone to replace the site at util-staging.domain.org with what you build. (Note: do not commit to the main branch and push to the git repo until you are sure that you want the changes to go to production, because the main branch will auto-build whatever you push to it to util.domain.org)

# Deployment - 

The app is designed in a docker container. A CI/CD pipeline is set up using drone.domain.org to auto-push the changes to the deployment server where apache is looking for them. The file that manages the ci/cd settings is the .drone.yml file in the repo

# DHCP -

To set up the DHCP Windows server::

The two files inside 'util-dhcp-server' need dropped on your dhcp server in the c:\Scripts\GetDHCP folder in order for
python to be able to reach them over ssh. Note that you do need the windows server set up with openssh for this access to work