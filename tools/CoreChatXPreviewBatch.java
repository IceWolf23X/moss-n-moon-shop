/* Offline adapter for CoreChatX's existing renderer. No Bukkit/server required. */
import com.corex.inventorysnapshot.api.*;
import com.corex.inventorysnapshot.assets.*;
import com.corex.inventorysnapshot.cache.*;
import com.corex.inventorysnapshot.config.*;
import com.corex.inventorysnapshot.render.*;
import com.corex.inventorysnapshot.render.model.*;
import com.corex.inventorysnapshot.render.model3d.*;
import com.corex.inventorysnapshot.snapshot.*;
import com.google.gson.*;
import java.nio.file.*;
import java.util.*;
import java.security.MessageDigest;
import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;

public final class CoreChatXPreviewBatch {
    public static void main(String[] args) throws Exception {
        Path site=Path.of(args[0]), vanilla=Path.of(args[1]), output=Path.of(args[2]);
        int scale=Integer.parseInt(args[4]);
        PackStack packs=new PackStack(List.of(new DirectoryPackSource(site),new DirectoryPackSource(Path.of(args[5])),new DirectoryPackSource(vanilla)));
        ModelResolver models=new ModelResolver(packs);
        TextureResolver textures=new TextureResolver(packs);
        RenderConfig config=new RenderConfig(RenderMode.ASSET_GRID,RenderedImageFormat.PNG,scale,false,false,null,null,null,null);
        RenderCacheService cache=new RenderCacheService(new CacheConfig(false,16,false,null,1,false,false));
        ItemModelResolver itemModels=new ItemModelResolver(packs,models);
        ItemImageRenderer renderer=new ItemImageRenderer(packs,textures,itemModels,new CuboidModelRenderer(textures,models),cache,config);
        InventoryImageRenderer completeRenderer=new InventoryImageRenderer(config,null,renderer);
        JsonArray ids=JsonParser.parseString(Files.readString(Path.of(args[3]))).getAsJsonArray();
        JsonObject items=new JsonObject(), failures=new JsonObject();
        Files.createDirectories(output);
        int completed=0;
        for(JsonElement element:ids){
            String id=element.getAsString();
            if(!id.matches("[a-z0-9_]+"))throw new IllegalArgumentException("Unsafe item ID");
            try {
                // The glint belongs to the complete item renderer, not renderBaseIcon.
                // Books and enchanted golden apples always glint, even without user-supplied enchantments.
                Map<String,Integer> enchantments=Set.of("enchanted_book","enchanted_golden_apple").contains(id)?Map.of("minecraft:mending",1):Map.of();
                ItemStackSnapshot snapshot=new ItemStackSnapshot(false,"minecraft:"+id,1,id,id,null,null,List.of(),List.of(),enchantments,null,null,null,null,Map.of("minecraft:context_dimension","minecraft:overworld","minecraft:time","0","minecraft:compass","0"),Map.of(),Map.of(),new byte[0]);
                ItemImageRenderer.IconResult icon=renderer.renderBaseIcon(snapshot,RenderMode.ASSET_GRID,config.itemSize());
                boolean visible=false;
                for(int y=0;y<icon.image().getHeight()&&!visible;y++)for(int x=0;x<icon.image().getWidth();x++)if((icon.image().getRGB(x,y)>>>24)>0){visible=true;break;}
                if(icon.usedFallback()||!visible){
                    failures.addProperty(id,icon.usedFallback()?icon.source():"empty-render");
                } else {
                    List<ResolvedModel> selectedModels=itemModels.resolveAll(snapshot);
                    boolean flat=enchantments.isEmpty()&&!selectedModels.isEmpty()&&selectedModels.stream().allMatch(model->!model.elementsDeclared()&&!model.layerTextures().isEmpty());
                    BufferedImage image=flat?renderer.renderBaseIcon(snapshot,RenderMode.ASSET_GRID,16).image():icon.image();
                    if(!enchantments.isEmpty()){
                        BufferedImage full=completeRenderer.renderSingleItem(snapshot,RenderMode.ASSET_GRID);
                        int inset=(full.getWidth()-config.itemSize())/2;
                        image=full.getSubimage(inset,inset,config.itemSize(),config.itemSize());
                    }
                    Path png=output.resolve(id+".png");
                    if(!ImageIO.write(image,"PNG",png.toFile()))throw new IllegalStateException("PNG encoder unavailable");
                    JsonObject record=new JsonObject();
                    record.addProperty("path","assets/minecraft/rendered/"+id+".png");
                    record.addProperty("source",icon.source());
                    record.addProperty("used_fallback",false);
                    record.addProperty("pixel_size",image.getWidth());
                    record.addProperty("flat",flat);
                    if(flat&&selectedModels.size()==1&&selectedModels.getFirst().layerTextures().size()==1){
                        ResourceLocation texture=selectedModels.getFirst().layerTextures().values().iterator().next();
                        if(texture.namespace().equals("minecraft"))record.addProperty("texture_candidate",AssetPathResolver.texturePath(texture));
                    }
                    if(!enchantments.isEmpty())record.addProperty("glint",true);
                    record.addProperty("sha256",HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(Files.readAllBytes(png))));
                    items.add(id,record);
                }
            } catch(Exception error){
                failures.addProperty(id,error.getClass().getSimpleName()+": "+error.getMessage());
            }
            completed++;
            if(completed%100==0)System.out.println("Rendered "+completed+" / "+ids.size());
        }
        JsonObject report=new JsonObject();
        report.add("items",items);report.add("failures",failures);
        Files.writeString(output.resolve("batch-report.json"),new GsonBuilder().setPrettyPrinting().create().toJson(report)+"\n");
        System.out.println("Successful: "+items.size()+"; missing/unsupported: "+failures.size());
    }
}
