---
layout: post
title: Domain Mapping with the ModelMapper library

tags:
- mapping
- modelmapper

description:  'Most of the applications define data abstraction layers. Usually
               the entities of the different layers show some similarities and mapping is required to transform
               one model to another. <br/>
               The <a href="http://modelmapper.org/" target="_blank">ModelMapper</a> library
               can be useful to help you resolve this task.'

---

### ModelMapper
Most of the applications define data abstraction layers. Usually
the entities of the different layers show some similarities and mapping is required to transform
 one model to another. <br/>
 The <a href="http://modelmapper.org/" target="_blank">ModelMapper</a> library
 can be useful to help you resolve this task.<br/>
<blockquote>
ModelMapper analyzes your object model to intelligently determine how data should be mapped.
No manual mapping is needed. ModelMapper does most of the work for you,
automatically projecting and flattening complex models.
</blockquote>

### Two domain model
For the mapping example I created two domain models, a DTO and an Entity class
to represent the same model in two different layers. <br/>
Both classes share the field 'name', and have a field for description-text under two different names.
Furthermore both have a field specific to that domain and not to be mapped.

![placeholder]({{ site.url }}/assets/dto_entity_class.png "DTO and Entity class")


### Configure mappings
To define a trivial mapping with ModelMapper one simply need to create a typeMap with the Source and Destination classes. <br/>
The mapping will look for all the properties and will convert them based on the <a href="http://modelmapper.org/user-manual/configuration/">configuration</a> and
 name matching strategy.

{% highlight java %}
modelMapper.createTypeMap(AnEntity.class, ADTO.class);
{% endhighlight %}

However in our example this will not find the connection between the 'text' and the 'description' properties.<br/>
Instead of creating a type map we need to configure the mapping for the non trivial fields by overriding the PropertyMap<S,D> class.

{% highlight java %}
public class AnEntityDTOMapper{
    ModelMapper modelMapper = new ModelMapper();

    public AnEntityDTOMapper() {
        modelMapper.addMappings(new PropertyMap<AnEntity, ADTO>() {
            protected void configure() {
                // 'name' is mapped automatically
                map().setText(source.getDescription());
                skip().setDtoOnlyProperty(null);
            }
        });
        modelMapper.addMappings(new PropertyMap<ADTO, AnEntity>() {
            protected void configure() {
                // 'name' is mapped automatically
                map().setDescription(source.getText());
                skip().setEntityOnlyProperty(null);
            }
        });
    }

    /* ... */
}
{% endhighlight %}
**Note:** the <code>map().setText(source.getDescription())</code> will not be called during the mapping!<br/>
It is not for the execution of a value assignment but for defining the connection between the fields.<br/>
See also <code>skip().setEntityOnlyProperty(null)</code> which will not result a null
value assignment just marks the field to be skipped.

### Usage - mapping single instances and collection of entities
The usage is simple, once you have defined a mapping scheme between certain type of objects
the mapping is convenient for single instances and for collections too.

{% highlight java %}
public class AnEntityDTOMapper{
    /* ... */

    public ADTO toDTO(AnEntity entity){
        return modelMapper.map(entity, ADTO.class);
    }
    public AnEntity toEntity(ADTO dto){
        return modelMapper.map(dto, AnEntity.class);
    }

    public List<ADTO> toDTOs(List<AnEntity> entities){
        return modelMapper.map(entities,  new TypeToken<List<ADTO>>() {}.getType());
    }

    public List<AnEntity> toEntities(List<ADTO> dtos){
        return modelMapper.map(dtos, new TypeToken<List<AnEntity>>() {}.getType());
    }
}
{% endhighlight %}

### Validate the mapping
Probably the biggest advantage of using the ModelMapper library is the built in validation.
If you are dealing with multiple domains, a big percentage of the reported issues might be resulted
by a missing property mapping. <br/>
The <code>validate()</code> method checks if all of the properties are mapped or skipped intentionally.<br/>
If not, it fails with a message about the missing mapping.

{% highlight java %}
public class DTOEntityConversionTest {

    @Test
    public void validateMappingTest(){
        new AnEntityDTOMapper().modelMapper.validate();
    }
}
{% endhighlight %}

#### Error output:

{% highlight sh %}
org.modelmapper.ValidationException: ModelMapper validation errors:

1) Unmapped destination properties found in TypeMap[ADTO -> AnEntity]:

	org.talangsoft.rest.devtools.converter.AnEntity.setEntityOnlyProperty()
{% endhighlight %}

### Conclusion
In a <a href="http://www.talangsoft.org/2015/02/19/model-mapping-with_java8/" target="_blank">previous blog post</a> a lightweight modelmapping with java 8 function references was described.<br/>
Using the <a href="http://modelmapper.org/" target="_blank">ModelMapper</a> library might not be that lightweight,
especially if the mapping is not trivial and the value of a property needs to be
<a href="http://modelmapper.org/user-manual/property-mapping/#converters">transformed</a> in between the two domains,
for example different date formats need to be used.

Too many transformations would result in a complex model mapping and would add a certain amount of boilerplate to your code if you vote for ModelMapper library.
 <br/>
However the validation is one great benefit and is really powerful to minimise the
risk of a bug caused by a missing mapping.<br/>
