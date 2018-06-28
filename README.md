# Constituent Timeline for Blackbaud CRM

This Blackbaud CRM SDK project creates an integrated timeline visualization of various constituent data using the vis.js library

**I will update this shortly to have some quick start instructions regarding how to deploy it**

### Quick Start

* Download and open solution in Visual Studio
* Compile DLL (you will likely need to change your compile location). It is currently expected that you will get some warnings upon compilation
* Move DLL to your custom DLL location for your CRM instance
* Download shared resources zip from dropbox (from references), unzip and move folder to your "\bbappfx\vroot\browser\htmlforms\custom" location. This has all the referenced code libraries that you will need 
* Copy the "\Shared.Timeline.Catalog-master\htmlforms\custom\share.timeline" folder from the downloaded code into your "\bbappfx\vroot\browser\htmlforms\custom" location as well
* In Page Designer mode of a CRM instance on the Constituent Page, add a new tab with a new section with the type of CustomUIModel. 
 * In the CustomUIModel field, enter the value *Shared.Timeline.Catalog.dll,Shared.Timeline.Catalog.ConstituentTimelineUIModel*. If you have changed the name of the project, please change references as appropriate.
 * Set the Context Type to PageContext:https://www.screencast.com/t/JtA8u9GcTaeE
 * Save new section
 
### References

This project depends on several external js libraries being installed in the Blackbaud CRM install location of /htmlforms/custom/shared_resources
* [D3] (https://d3js.org/)
* [Jquery UI] (https://jqueryui.com/)
* [Vis.js] (http://visjs.org/)
* [daredevel's jQuery Tree] (https://github.com/daredevel/jquery-tree)
* [share-resources bundle] (https://www.dropbox.com/s/gxsoaj58acw0vuh/shared_resources.zip?dl=0)
  * This is a zip of the shared resources that can be unpacked to htmlforms\custom\shared_resources
* [Blackbaud SDK] (https://www.blackbaud.com/files/support/guides/infinitydevguide/infsdk-developer-help.htm)

## Authors

* **Greg Harmelink on behalf of the University of Georgia**
